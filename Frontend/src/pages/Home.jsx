import React from 'react'
import { Link } from 'react-router-dom'
import toast from "react-hot-toast";
import ProductCard from '../components/Product-card'
import { useLatestProductQuery } from '../redux/api/productAPI'
import {Skeleton} from "../components/Loader"
import { useDispatch } from 'react-redux';
import { addToCart } from '../redux/reducer/cartReducer';

const Home = () => {
  
  const {data , isLoading , isError} = useLatestProductQuery("");

  const dispatch = useDispatch();

  const addToCartHandler = (cartItem) => {
    if(cartItem.stock < 1) return toast.error("Out of Stock");
    dispatch(addToCart(cartItem));
    toast.success(`Added to cart`);
  };
  
  if(isError) toast.error("Cannot fetch the Products");

  return (
    <div className='home'>
      <section >
        
      </section>
      <h1>
        Latest Products
        <Link to="/search" className='findmore'>More</Link>
      </h1>

      <main>
        { isLoading? (<Skeleton width='80vw'/>) : (
          data?.products.map((i) => (<ProductCard 
            key={i._id}
            productId={i._id} 
            name={i.name}
             price={i.price} 
             stock={i.stock} 
             handler={addToCartHandler} photo={i.photo} />
        )))}
      </main>
    </div>
  )
}

export default Home
