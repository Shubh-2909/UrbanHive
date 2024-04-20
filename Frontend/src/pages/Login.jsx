import React, { useState } from 'react'
import {FcGoogle} from "react-icons/fc"
import toast from "react-hot-toast";
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../firebase';
import { useLoginMutation } from '../redux/api/userAPI';


const Login = () => {
    const [gender , setGender] = useState("");
    const [date , setDate] = useState("");
    const [login] = useLoginMutation()

    const loginHandler = async () => {
      try {
        const provider = new GoogleAuthProvider();  
        const {user} = await signInWithPopup(auth , provider);
        const res = await login({
          name:user.displayName,
          email:user.email,
          photo: user.photoURL,
          role: "user",
          gender,
          dob:date,
          _id:user.uid
        })
        if("data" in res){
          toast.success(res.data.message);
        }else{
          const error = res.error ;
          const message = error.data;
          toast.error(message.message);
        }
        console.log(user);
      } catch (error) {
        toast.error("Sign In Failed");
      }
    }
  return (
    <div className='login'>
      <main>
        <h1 className='heading'>Login</h1>
        <div>
            <label>Gender</label>
            <select value={gender} onChange={e => setGender(e.target.value)}>
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
            </select>
        </div>

        <div>
            <label>Date of Birth</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}/>
        </div>

        <div>
            <p>Already Signed In Once</p>
            <button onClick={loginHandler}>
                <FcGoogle/><span>Sign in with Google</span>
            </button>
        </div>
      </main>
    </div>
  )
}

export default Login
