const express = require('express');
const app = express();
const port = 3000;
const concentDb = require('./config/db');
const bodyParser = require('body-parser');
const ProducRouter = require('./routes/Productroutes');
const Login = require('./controllers/Login');
const Loginad = require('./controllers/Loginad');
const Discoun = require('./controllers/discountcontrollers');
const orderControllers = require('./controllers/orderControllers');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const engines = require('consolidate');
const paypal = require('paypal-rest-sdk');
const path = require('path'); // Add this line to include the 'path' module
const coffeeshop = require('./controllers/coffeeshop');

app.engine('ejs', require('ejs').renderFile);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
paypal.configure({
    mode: 'sandbox', // sandbox or live
    client_id: 'AQArcsnDG_tvfeUCXTWRqS4kwMbMxahX9YobcTmMGawr7JOOhldDYceAqPQx_9UyBl39s7oSKEPqOVQo',
    client_secret: 'EJ13fSxKbicL_ZuDHdkgA9-nzMq3bOy11qEc5fWW0MBqoOqRuO4GwDcHCDBNYBvpQl-89Nuj62qfHbGw',
});

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/paypal', (req, res) => {
    var create_payment_json = {
        intent: 'sale',
        payer: {
            payment_method: 'paypal',
        },
        redirect_urls: {
            return_url: 'http://192.168.1.12:3000/success',
            cancel_url: 'http://192.168.1.12:3000/cancel',
        },
        transactions: [
            {
                item_list: {
                    items: [
                        {
                            name: 'item',
                            sku: 'item',
                            price: '1.00',
                            currency: 'USD',
                            quantity: 1,
                        },
                    ],
                },
                amount: {
                    currency: 'USD',
                    total: '1.00',
                },
                description: 'This is the payment description.',
            },
        ],
    };

    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            throw error;
        } else {
            console.log('Create Payment Response');
            console.log(payment);
            res.redirect(payment.links[1].href);
        }
    });
});
app.use('/uploads', express.static('uploads'));
app.get('/success', (req, res) => {
    var PayerID = req.query.PayerID;
    var paymentId = req.query.paymentId;
    var execute_payment_json = {
        payer_id: PayerID,
        transactions: [
            {
                amount: {
                    currency: 'USD',
                    total: '1.00',
                },
            },
        ],
    };

    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
        if (error) {
            console.log(error.response);
            throw error;
        } else {
            console.log('Get Payment Response');
            console.log(JSON.stringify(payment));
            res.render('success');
        }
    });
});

app.get('/cancel', (req, res) => {
    res.render('cancel');
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use(cookieParser());

concentDb();

app.use('/api', Login);
app.use('/discount', Discoun);
app.use('/apiad', Loginad);
app.use('/order', orderControllers);
app.use('/products', ProducRouter);
app.use('/coffeeshop', coffeeshop);

app.listen(port, () => console.log(`App listening at 192.168.164.1:${port}`));
