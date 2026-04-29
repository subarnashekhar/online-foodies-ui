import React, { useContext, useState } from "react";
import "./PlaceOrder.css";
import { assets } from "../../assets/assets";
import { StoreContext } from "../../context/StoreContext";
import { calculateCartTotals } from "../../util/cartUtils";
import { toast } from "react-toastify";
import { STRIPE_KEY } from "../../util/constants";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { useNavigate } from "react-router-dom";
import CheckoutForm from "../../components/Checkout/CheckoutForm";
import { createOrder } from "../../service/orderService";
import { clearCartItems } from "../../service/cartService";

const stripePromise = loadStripe(STRIPE_KEY);


const PlaceOrder = () => {
  const { foodList, quantities, setQuantities, token } =
    useContext(StoreContext);
  const navigate = useNavigate();

  const [clientSecret, setClientSecret] = useState("");
  const [amount, setAmount] = useState(null);
  const [loading, setLoading] = useState(false);

  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    address: "",
    state: "",
    city: "",
    zip: "",
  });

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData((data) => ({ ...data, [name]: value }));
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    const zipRegex = /^[0-9]{5}(?:-[0-9]{4})?$/;
    if (!zipRegex.test(data.zip.trim())) {
      toast.error("Please enter a valid U.S. ZIP code (e.g. 12345 or 12345-6789).");
      return;
    }

    const orderData = {
      userAddress: `${data.firstName} ${data.lastName}, ${data.address}, ${data.city}, ${data.state}, ${data.zip}`,
      phoneNumber: data.phoneNumber,
      email: data.email,
      orderedItems: cartItems.map((item) => ({
        foodId: item.foodId,
        quantity: quantities[item.id],
        price: item.price * quantities[item.id],
        category: item.category,
        imageUrl: item.imageUrl,
        description: item.description,
        name: item.name,
      })),
      amount: total.toFixed(2),
      orderStatus: "Preparing",
    };

    try {
      console.log("Placing order with data:", orderData);
      const response = await createOrder(orderData, token);
      console.log("Order creation response:", response);
      console.log(JSON.stringify(response));

      if (response.stripeClientSecret) {
        setClientSecret(response.stripeClientSecret);
        setAmount(Math.round(total * 100)); // Convert to cents for Stripe
      } else {
        toast.error("Unable to place order. Please try again.");
      }
    } catch (error) {
      toast.error("Unable to place order. Please try again.");
    }
  };

  const clearCart = async () => {
    try {
      await clearCartItems(token, setQuantities);
    } catch (error) {
      toast.error("Error while clearing the cart.");
    }
  };

  const handlePaymentSuccess = async (paymentIntent) => {
    toast.success("Payment successful.");
    await clearCart();
    navigate("/myorders");
  };

  const handlePaymentFailure = (error) => {
    toast.error(error.message || "Payment failed. Please try again.");
  };

  //cart items
  const cartItems = foodList.filter((food) => quantities[food.id] > 0);

  //calcualtiong
  const { subtotal, shipping, tax, total } = calculateCartTotals(
    cartItems,
    quantities
  );

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100">
      <div className="container mt-4">
        <main>
        <div className="py-5 text-center">
          <img
            className="d-block mx-auto"
            src={assets.logo}
            alt=""
            width="98"
            height="98"
          />
        </div>
        <div className="row g-5 justify-content-center">
          {!clientSecret && (
            <div className="col-md-7 col-lg-8">
              <h4 className="mb-3">Billing address</h4>
              <form className="needs-validation" onSubmit={onSubmitHandler}>
                <div className="row g-3">
                  <div className="col-sm-6">
                    <label htmlFor="firstName" className="form-label">
                      First name
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="firstName"
                      placeholder="Jhon"
                      required
                      name="firstName"
                      onChange={onChangeHandler}
                      value={data.firstName}
                    />
                  </div>

                  <div className="col-sm-6">
                    <label htmlFor="lastName" className="form-label">
                      Last name
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="lastName"
                      placeholder="Doe"
                      value={data.lastName}
                      onChange={onChangeHandler}
                      name="lastName"
                      required
                    />
                  </div>

                  <div className="col-12">
                    <label htmlFor="email" className="form-label">
                      Email
                    </label>
                    <div className="input-group has-validation">
                      <span className="input-group-text">@</span>
                      <input
                        type="email"
                        className="form-control"
                        id="email"
                        placeholder="Email"
                        required
                        name="email"
                        onChange={onChangeHandler}
                        value={data.email}
                      />
                    </div>
                  </div>
                  <div className="col-12">
                    <label htmlFor="phone" className="form-label">
                      Phone Number
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      id="phone"
                      placeholder="9876543210"
                      required
                      value={data.phoneNumber}
                      name="phoneNumber"
                      onChange={onChangeHandler}
                    />
                  </div>
                  <div className="col-12">
                    <label htmlFor="address" className="form-label">
                      Address
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="address"
                      placeholder="1234 Main St"
                      required
                      value={data.address}
                      name="address"
                      onChange={onChangeHandler}
                    />
                  </div>
                  <div className="col-md-5">
                    <label htmlFor="state" className="form-label">
                      State
                    </label>
                    <select
                      className="form-select"
                      id="state"
                      required
                      name="state"
                      value={data.state}
                      onChange={onChangeHandler}
                    >
                      <option value="">Choose...</option>
                      <option>Alabama</option>
                      <option>Alaska</option>
                      <option>Arizona</option>
                      <option>Arkansas</option>
                      <option>California</option>
                      <option>Colorado</option>
                      <option>Connecticut</option>
                      <option>Delaware</option>
                      <option>Florida</option>
                      <option>Georgia</option>
                      <option>Hawaii</option>
                      <option>Idaho</option>
                      <option>Illinois</option>
                      <option>Indiana</option>
                      <option>Iowa</option>
                      <option>Kansas</option>
                      <option>Kentucky</option>
                      <option>Louisiana</option>
                      <option>Maine</option>
                      <option>Maryland</option>
                      <option>Massachusetts</option>
                      <option>Michigan</option>
                      <option>Minnesota</option>
                      <option>Mississippi</option>
                      <option>Missouri</option>
                      <option>Montana</option>
                      <option>Nebraska</option>
                      <option>Nevada</option>
                      <option>New Hampshire</option>
                      <option>New Jersey</option>
                      <option>New Mexico</option>
                      <option>New York</option>
                      <option>North Carolina</option>
                      <option>North Dakota</option>
                      <option>Ohio</option>
                      <option>Oklahoma</option>
                      <option>Oregon</option>
                      <option>Pennsylvania</option>
                      <option>Rhode Island</option>
                      <option>South Carolina</option>
                      <option>South Dakota</option>
                      <option>Tennessee</option>
                      <option>Texas</option>
                      <option>Utah</option>
                      <option>Vermont</option>
                      <option>Virginia</option>
                      <option>Washington</option>
                      <option>West Virginia</option>
                      <option>Wisconsin</option>
                      <option>Wyoming</option>
                    </select>
                  </div>

                  <div className="col-md-4">
                    <label htmlFor="city" className="form-label">
                      City
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="city"
                      placeholder="Enter city"
                      required
                      name="city"
                      value={data.city}
                      onChange={onChangeHandler}
                    />
                  </div>

                  <div className="col-md-3">
                    <label htmlFor="zip" className="form-label">
                      Zip
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="zip"
                      placeholder="12345 or 12345-6789"
                      required
                      pattern="^[0-9]{5}(?:-[0-9]{4})?$"
                      title="Enter a valid U.S. ZIP code: 12345 or 12345-6789"
                      name="zip"
                      maxLength={10}
                      value={data.zip}
                      onChange={onChangeHandler}
                    />
                  </div>
                </div>

                <hr className="my-4" />

                <button
                  className="w-100 btn btn-primary btn-lg"
                  type="submit"
                  disabled={cartItems.length === 0}
                >
                  Continue to checkout
                </button>
              </form>
            </div>
          )}

          <div className="col-md-5 col-lg-4 order-md-last">
            <h4 className="d-flex justify-content-between align-items-center mb-3">
              <span className="text-primary">Your cart</span>
              <span className="badge bg-primary rounded-pill">
                {cartItems.length}
              </span>
            </h4>
            <ul className="list-group mb-3">
              {cartItems.map((item) => (
                <li
                  key={item.id}
                  className="list-group-item d-flex justify-content-between lh-sm"
                >
                  <div>
                    <h6 className="my-0">{item.name}</h6>
                    <small className="text-body-secondary">
                      Qty: {quantities[item.id]}
                    </small>
                  </div>
                  <span className="text-body-secondary">
                    &#x24;{item.price * quantities[item.id]}
                  </span>
                </li>
              ))}
              <li className="list-group-item d-flex justify-content-between">
                <div>
                  <span>Shipping</span>
                </div>
                <span className="text-body-secondary">
                  &#x24;{subtotal === 0 ? 0.0 : shipping.toFixed(2)}
                </span>
              </li>
              <li className="list-group-item d-flex justify-content-between">
                <div>
                  <span>Tax (10%)</span>
                </div>
                <span className="text-body-secondary">
                  &#x24;{tax.toFixed(2)}
                </span>
              </li>

              <li className="list-group-item d-flex justify-content-between">
                <span>Total (USD)</span>
                <strong>&#x24;{total.toFixed(2)}</strong>
              </li>
            </ul>
            {clientSecret && (
              <Elements stripe={stripePromise}>
                <CheckoutForm 
                  clientSecret={clientSecret} 
                  amount={amount} 
                  onSuccess={handlePaymentSuccess} 
                  onFailure={handlePaymentFailure} 
                />
              </Elements>
            )}
          </div>

        </div>
      </main>
    </div>
    </div>
  );
};

export default PlaceOrder;
