import React from 'react'
import { FaPlus } from 'react-icons/fa';
import { server } from '../redux/store';

const ProductCard = ({productId , price , name , photo , stock , handler }) => {
  return (
    <div className='productcard'>
      <img src={`${server}/${photo}`} alt={name} />
      <p>{name}</p>
      <span>₹{price}</span>
      <div>
        <button onClick={() => handler({
          productId , price , name , photo , stock , quantity:1
        })}><FaPlus/></button>
      </div>
    </div>
  )
}

export default ProductCard
