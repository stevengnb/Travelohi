import { IChildren } from "../interface/children-interface"
import React from 'react'

function MainTemplate({children} : IChildren) {
  return (
    <div>
        {children}
    </div>
  )
}

export default MainTemplate;