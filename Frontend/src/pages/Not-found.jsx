import React from 'react'
import {MdError} from "react-icons/md"

const Notfound = () => {
  return (
    <div className='container not-found'>
      <MdError></MdError>
      <h1>Page Not Found</h1>
    </div>
  )
}

export default Notfound
