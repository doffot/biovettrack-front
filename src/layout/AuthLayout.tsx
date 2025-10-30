import { Outlet } from "react-router-dom";
import Logo from "../components/Logo";



export default function AuthLayout() {
  return (
    <>
     <div>
      <div >
        {/* <Logo size="xl" showText={true} showSubtitle={false} layout="vertical" /> */}
      </div>
      <div>
        <Outlet/>
      </div>
     </div>
    </>
  )
}
