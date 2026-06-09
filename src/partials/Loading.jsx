import React from 'react'

const Loading = () => {
  return (
    <div className='grid place-items-center h-dvh w-full bg-white'>
        <div className="relative z-2 w-20 h-20 md:w-35 md:h-35">
            <img className='w-full h-full object-contain' src="/images/pcp_logo.png" alt="Logo" />
        </div>
    </div>
  )
}

export default Loading