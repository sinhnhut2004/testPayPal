const express = require('express');
const ejs = require('ejs');
const paypal = require('paypal-rest-sdk');

paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'ATZx8d85uVIpa1kHoTDKlTqVhAyBBnRPgOtYnRWS6y2Wt6fQKVBkqHiDbDow1OJD6uwtA6oTn0e8ogyl',
    'client_secret': 'EGdamf4Qv6fBhnTrReTLNJk-hmyI_gKUwdkqVU58iFGjDUNetTZ3CNwJZOwA3m7s32F5CgaDh99HPVv-'
});

const app = express();

app.set('view engine', 'ejs');

app.get('/', (req, res) => res.render('index'));

app.post('/pay', (req, res) => {
    var money = "80";

    const create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://localhost:3000/success",
            "cancel_url": "http://localhost:3000/cancel"
        },
        "transactions": [{
        //     "item_list": {
        //         "items": [{
        //             "name": "Iphone 4S",
        //             "sku": "001",
        //             "price": "25.00",
        //             "currency": "USD",
        //             "quantity": 1
        //         }]
        //     },
            "amount": {
                "currency": "USD",
                "total": money
            },
            "description": "Iphone 4S cũ giá siêu rẻ"
        }]
    };

    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            throw error;
        } else {
            for (let i = 0; i < payment.links.length; i++) {
                if (payment.links[i].rel === 'approval_url') {
                    res.redirect(payment.links[i].href);
                }
            }

        }
    });

});

app.get('/success', (req, res) => {

    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;

    const execute_payment_json = {
        "payer_id": payerId,
        "transactions": [{
            "amount": {
                "currency": "USD",
                "total": "25.00"
            }
        }]
    };
    paypal.payment.execute(paymentId, execute_payment_json, function(error, payment) {
        if (error) {
            console.log(error.response);
            throw error;
        } else {
            console.log(JSON.stringify(payment));
            res.send('Success (Mua hàng thành công)');
        }
    });
});

app.get('/cancel',(req,res) => res.send('Cancelled (Đơn hàng đã hủy)'));

app.listen(3000, () => console.log('Server Started'));