
/**
 * BACKEND CONTROLLER REFERENCE
 * 
 * Install dependencies:
 * npm install paytmchecksum axios
 * 
 * Usage in Express Route:
 * app.post('/api/payment/create-order', createOrder);
 * app.post('/api/payment/verify', verifyPayment);
 */

const PaytmChecksum = require('paytmchecksum');
const https = require('https');

// CONFIGURATION
const PAYTM_MID = process.env.PAYTM_MID;
const PAYTM_MERCHANT_KEY = process.env.PAYTM_MERCHANT_KEY;
const WEBSITE = "WEBSTAGING"; // or "DEFAULT" for production
const INDUSTRY_TYPE_ID = "Retail";
const CHANNEL_ID = "WEB";

/**
 * 1. Initiate Transaction (Create Token)
 */
exports.createOrder = async (req, res) => {
    const { amount, plan } = req.body;
    const orderId = "ORDER_" + Date.now();

    var paytmParams = {};

    paytmParams.body = {
        "requestType"   : "Payment",
        "mid"           : PAYTM_MID,
        "websiteName"   : WEBSITE,
        "orderId"       : orderId,
        "callbackUrl"   : "https://your-domain.com/api/payment/callback",
        "txnAmount"     : {
            "value"     : amount,
            "currency"  : "INR",
        },
        "userInfo"      : {
            "custId"    : "CUST_" + Date.now(), // Get from logged in user ID
        },
    };

    try {
        const checksum = await PaytmChecksum.generateSignature(JSON.stringify(paytmParams.body), PAYTM_MERCHANT_KEY);

        paytmParams.head = {
            "signature"    : checksum
        };

        var post_data = JSON.stringify(paytmParams);

        // STAGING URL (Use Production URL for live)
        const url = `https://securegw-stage.paytm.in/theia/api/v1/initiateTransaction?mid=${PAYTM_MID}&orderId=${orderId}`;

        // Make HTTP Request to Paytm
        const paytmResponse = await makePaytmRequest(url, post_data);
        
        // Return Token to Frontend
        res.json({
            txnToken: paytmResponse.body.txnToken,
            orderId: orderId,
            mid: PAYTM_MID
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to initiate transaction" });
    }
};

/**
 * 2. Verify Transaction (Webhook or Manual Check)
 */
exports.verifyPayment = async (req, res) => {
    const { orderId } = req.body;

    var paytmParams = {};
    paytmParams.body = {
        "mid" : PAYTM_MID,
        "orderId" : orderId,
    };

    try {
        const checksum = await PaytmChecksum.generateSignature(JSON.stringify(paytmParams.body), PAYTM_MERCHANT_KEY);
        paytmParams.head = { "signature" : checksum };

        var post_data = JSON.stringify(paytmParams);

        // STAGING URL
        const url = "https://securegw-stage.paytm.in/v3/order/status";

        const response = await makePaytmRequest(url, post_data);
        
        if (response.body.resultInfo.resultStatus === "TXN_SUCCESS") {
            // Fulfill the order (Update DB user credits)
            res.json({ status: "success", message: "Payment verified" });
        } else {
            res.status(400).json({ status: "failed", message: "Payment failed" });
        }

    } catch (error) {
        res.status(500).json({ error: "Verification failed" });
    }
};

// Helper function for HTTPS request
function makePaytmRequest(url, data) {
    return new Promise((resolve, reject) => {
        var options = {
            hostname: 'securegw-stage.paytm.in', // Change for production
            port: 443,
            path: url.split('paytm.in')[1],
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        var req = https.request(options, (res) => {
            let responseBody = '';
            res.on('data', (chunk) => { responseBody += chunk; });
            res.on('end', () => { resolve(JSON.parse(responseBody)); });
        });

        req.on('error', (e) => { reject(e); });
        req.write(data);
        req.end();
    });
}
