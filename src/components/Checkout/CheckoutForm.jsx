import React, { useState } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { toast } from "react-toastify";

const CheckoutForm = ({ clientSecret, amount, onSuccess, onFailure }) => {
  const stripe = useStripe();
  const elements = useElements();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!stripe || !elements) {
      setMessage("Stripe.js has not loaded yet.");
      return;
    }
    setLoading(true);
    const cardElement = elements.getElement(CardElement);

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: cardElement }
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      if (onFailure) onFailure(error);
      return;
    }

    if (paymentIntent && paymentIntent.status === "succeeded") {
      setMessage("🎉 Payment successful!");
      if (onSuccess) onSuccess(paymentIntent);
    } else {
      setMessage(`Payment status: ${paymentIntent?.status}`);
      if (onFailure) onFailure({ message: `Payment status: ${paymentIntent?.status}` });
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:'12px'}}>
      <div style={{padding:'12px',border:'1px solid #ddd',borderRadius:8}}>
        <CardElement />
      </div>

      <button disabled={loading} style={{
        background:'#6772e5', color:'#fff', padding:'12px', borderRadius:8, border:'none', cursor:'pointer'
      }}>
        {loading ? "Processing…" : `Pay $${(amount/100).toFixed(2)}`}
      </button>

      {message && <div style={{marginTop:8, fontWeight:600}}>{message}</div>}
    </form>
  );
};

export default CheckoutForm;
