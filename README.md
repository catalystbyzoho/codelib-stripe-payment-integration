# Stripe Payment Integration CodeLib Solution

This CodeLib solution helps you handle billing, checkout and payment functionalities in your Catalyst application by integrating with a trusted third party payment processor, ***Stripe***.

**Note:** You can get more detailed information on the steps to install and configure the Stripe Payment Integration CodeLib solution from your Catalyst console. You must navigate to the bottom of your Catalyst console where you will find the ***Catalyst CodeLib*** section. You can click on the **Stripe Payment Integration CodeLib** tile to access the steps.

**How does the CodeLib Solution work?**

Upon installing this CodeLib solution, pre-defined Catalyst components specific to the solution will be configured in your project. For the Stripe Payment Integration CodeLib solution, this will include a pre-configured [Catalyst Serverless function](https://catalyst.zoho.com/help/functions.html) ([Advanced I/O](https://catalyst.zoho.com/help/advancedio-functions.html)) in Node.js.

When the user performs the checkout operation in the client, you can configure to execute the Advanced I/O function's endpoint(**/session**) on occurrence of that action. When this happens, a checkout session is created with Stripe by passing the required information such as the price ID of each product, its quantity, the currency options, and the acceptable payment methods from Catalyst's end. You can refer to [this](https://support.stripe.com/questions/how-to-create-products-and-prices) page to create products and their prices. Fetch the API ID for the specific price value and pass that value in the price_id param.

We will also be configuring a key named **CODELIB\_SECRET\_KEY** in the functions component which you will pass in the request header every time you try to access the endpoint of the pre-configured function in the CodeLib solution. This key allows you to access the Catalyst resources of the CodeLib solution securely.

This checkout session renders all the necessary information on the Stripe dashboard and also re-directs the user from the Catalyst application to the payment page hosted in Stripe. Therefore, Catalyst handles the product inventory from its end, and only passes the checkout information to Stripe for payment processing.

After the user chooses the payment method and completes with payment processing in Stripe's payment page, they will be re-directed to the configured URLs based on the success, failure or cancellation of the payment at any instance.

**Note :** You can configure the re-direction links and pages based on your application's requirements for both success and failure scenarios.

We have pre-configured the following properties in the Stripe Payment Integration CodeLib solution:

* Card payments are supported.

* Shipping to India and US is allowed, and if the shipping time is within a time frame of 5-7 business days, then the shipping charges are *NIL*.

* If the user opts for fast shipping and the estimated shipping time is a day prior to the nominal shipping time, then they will be charged a price of *15USD*.

**Note :**

- You can modify or update the properties mentioned above at any point of time in the function's code based on your business requirements, after installation of the CodeLib solution.
- Please ensure you [deploy](https://catalyst.zoho.com/help/cli-deploy.html) the CodeLib solution again from your local terminal after you make these configuration changes in the function to ensure that the changes are reflected in the console.

You can get more detailed information on the steps to install and configure the Stripe Payments Integration CodeLib solution from the ***Catalyst CodeLib*** section in your Catalyst console.

**Resources Involved:**

The following Catalyst resource is used as a part of the Stripe Payment Integration CodeLib solution:

**1. [Catalyst Serverless Functions](https://catalyst.zoho.com/help/functions.html) :** The **stripe\_payment\_integration** function **([Advanced I/O](https://catalyst.zoho.com/help/advancedio-functions.html))** handles the logic to be executed upon checkout from the Catalyst end. When the **/session** endpoint is invoked, a checkout session is initiated with Stripe. You must pass the quantity of the products, their [price ID](https://support.stripe.com/questions/how-to-create-products-and-prices), payment success and failure re-direction URLs in the request payload while invoking the function's endpoint as a cURL request. The checkout information will be made available on Stripe's dashboard and then the user will be re-directed to the payment page in Stripe. Based on the success or failure status of the payment being made, the user will be re-directed to the configured application URL.
