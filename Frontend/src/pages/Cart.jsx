import React, { useEffect, useState } from 'react'
import { VscError } from "react-icons/vsc";
import Cartitem from '../components/Cart-item';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, applyDiscount, calculatePrice, cartReducer, removeCartItem } from '../redux/reducer/cartReducer';
import axios from 'axios';
import { server } from '../redux/store';



const Cart = () => {

  const {cartItems , subtotal , tax , total , shippingCharges , discount } = useSelector((state) => state.cartReducer)

  const dispatch = useDispatch();

  const [couponCode , setCouponCode] = useState("")
  const [isValidCouponCode , setIsValidCouponCode] = useState(false);

  const incrementHandler = (cartItem) => {
    if(cartItem.quantity >= cartItem.stock) return ;

    dispatch(addToCart({...cartItem , quantity :cartItem.quantity +1 }));
  };

  const decrementHandler = (cartItem) => {
    if(cartItem.quantity <= 1) return;

    dispatch(addToCart({...cartItem , quantity :cartItem.quantity -1 }));
  };

  const removeHandler = (productId) => {
    dispatch(removeCartItem(productId));
  };
  
  useEffect(() => {
    const {token , cancel} = axios.CancelToken.source();

    const timeOutId = setTimeout(() => {

      axios.get(`${server}/api/v1/payment/discount?coupon= ${couponCode}`).then((res)=> {
        dispatch(applyDiscount(res.data.discount));
        setIsValidCouponCode(true);
        dispatch(calculatePrice());
      })
      .catch(() => {
        dispatch(applyDiscount(0));
        setIsValidCouponCode(false);
        dispatch(calculatePrice());
      })
    },1000)

    return() => {
      clearTimeout(timeOutId);
      cancel();
      setIsValidCouponCode(false);
    }
  } , [couponCode])

  useEffect(() => {
    dispatch(calculatePrice());
  } , [cartItems])


  return (
    <div className='cart'>
      <main>
        {
          cartItems.length > 0 ? cartItems.map((i , index) => (<Cartitem key={index} 
            incrementHandler={incrementHandler}
            decrementHandler = {decrementHandler}
            removeHandler ={removeHandler}
            cartItem={i}
            />) ) :( <h1>No items added</h1>)
        }
      </main>
      <aside>
        <p>Subtotal: ₹{subtotal}</p>
        <p>Shipping Charges: ₹{shippingCharges}</p>
        <p>Tax: ₹{tax}</p>
        <p>
          Discount: <em> - 
          ₹{discount}
          </em>
        </p>
        <p>
          <b>Total:  ₹{total}</b>
        </p>

        <input type="text"
        placeholder='Coupon Code' value={couponCode} onChange={(e) => setCouponCode(e.target.value)}/>


        {
          couponCode && (isValidCouponCode? (<span className='green'>
          ₹{discount} off using the <code>{couponCode}</code>
        </span>) : (<span className='red'>Invalid Coupon Code <VscError/></span>))
        }

        {
          cartItems.length>0 && <Link to="/shipping">Checkout</Link>
        }


      </aside>
    </div>
  )
}

export default Cart
