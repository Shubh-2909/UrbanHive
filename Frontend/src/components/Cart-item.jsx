import React from 'react'
import {Link} from "react-router-dom"
import { FaTrash } from "react-icons/fa";
import { server } from '../redux/store';
  

const Cartitem = ({cartItem , incrementHandler , decrementHandler , removeHandler}) => {
  const {photo , productId , name , price , quantity} = cartItem;

  return (
    <div className='cart-item'>
      <img src={`${server}/${photo}`} alt={name} />
      <article>
        <Link to={`/product/${productId}`}>{name}</Link>
        <span>₹{price}</span>
      </article>
      <div>
        <button onClick={() =>decrementHandler(cartItem)}>-</button>
        <p>{quantity}</p>
        <button onClick={() =>incrementHandler(cartItem)}>+</button>
      </div>

      <button onClick={() => removeHandler(productId)}>
        <FaTrash />
      </button>
    </div>
  )
}

export default Cartitem
