const Ajv = require('ajv')
const Stripe = require('stripe')
const Express = require('express')
const AjvErrors = require('ajv-errors')
const AjvFormats = require('ajv-formats')

const { AuthService } = require('./services')
const { AppError, ErrorHandler } = require('./utils')

const AppConstants = require('./constants')

const ValidationSchema = {
  type: 'object',

  properties: {
    success_url: {
      type: 'string',
      format: 'uri',
      errorMessage: {
        format: "Invalid value for 'success_url'."
      }
    },
    cancel_url: {
      type: 'string',
      format: 'uri',
      errorMessage: {
        format: "Invalid value for 'cancel_url'."
      }
    },
    items: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        required: ['price_id', 'quantity'],
        properties: {
          price_id: {
            type: 'string',
            minLength: 1,
            errorMessage: {
              minLength: "'price_id' cannot be empty."
            }
          },
          quantity: {
            type: 'number',
            errorMessage: {
              type: "'quantity' should be a number."
            }
          }
        },
        errorMessage: {
          type: "'items' should be an array of objects.",
          required: {
            price_id: "items should contain a property 'price_id'",
            quantity: "items should contain a property 'quantity'"
          }
        }
      },
      errorMessage: {
        type: "'items' should be an array of objects.",
        minItems: "'items' should contain atleast an element."
      }
    }
  },
  required: ['cancel_url', 'success_url', 'items'],
  errorMessage: {
    required: {
      success_url: "'success_url' cannot be empty.",
      cancel_url: "'cancel_url' cannot be empty.",
      items: "'items' cannot be empty."
    }
  }
}

const app = Express()

app.use(Express.json())
app.use((req, res, next) => {
  try {
    if (
      !AuthService.getInstance().isValidRequest(
        req.get(AppConstants.Headers.CodelibSecretKey)
      )
    ) {
      throw new AppError(
        400,
        "You don't have permission to perform this operation. Kindly contact your administrator for more details."
      )
    }

    next()
  } catch (err) {
    const { statusCode, ...others } = ErrorHandler.getInstance().processError(err)

    res.status(statusCode).send(others)
  }
})
app.post('/session', async (req, res) => {
  try {
    const ajvInstance = AjvErrors(
      AjvFormats(
        new Ajv({
          allErrors: true,
          coerceTypes: true
        }),
        {
          singleError: true
        }
      )
    )

    const validate = ajvInstance.compile(ValidationSchema)

    if (!validate(req.body)) {
      throw new AppError(400, validate.errors[0].message)
    }

    const items = req.body.items
    const cancelUrl = req.body.cancel_url
    const successUrl = req.body.success_url

    const stripeInstance = Stripe(process.env[AppConstants.Env.StripeKey])

    const data = await stripeInstance.checkout.sessions.create({
      payment_method_types: ['card'],
      shipping_address_collection: {
        allowed_countries: ['US', 'IN'] // Shipping is allowed to USA and India
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: 0, // Free shipping if standard delivery
              currency: 'usd'
            },
            display_name: 'Free shipping',
            // Delivers between 5-7 business days
            delivery_estimate: {
              minimum: {
                unit: 'business_day', // Shipping period is set as 5 to 7 business days
                value: 5
              },
              maximum: {
                unit: 'business_day',
                value: 7
              }
            }
          }
        },
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: 1500, // 15 USD is set as shipping charge if next day delivery.
              currency: 'usd'
            },
            display_name: 'Next day',
            // Delivers in exactly 1 business day
            delivery_estimate: {
              minimum: {
                unit: 'business_day',
                value: 1
              },
              maximum: {
                unit: 'business_day',
                value: 1
              }
            }
          }
        }
      ],
      line_items: items.map((item) => ({
        price: item.price_id,
        quantity: item.quantity
      })),
      mode: 'payment',
      cancel_url: cancelUrl,
      success_url: successUrl
    })

    res.status(200).send({ status: 'success', data })
  } catch (error) {
    const processedError = ErrorHandler.getInstance().processError(error)
    res.status(processedError.statusCode).send({
      status: processedError.status,
      response: processedError.message
    })
  }
})

app.all('*', function (_req, res) {
  res.status(404).send({
    status: 'failure',
    message: "We couldn't find the requested url."
  })
})
module.exports = app
