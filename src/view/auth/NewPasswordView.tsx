import { useState } from "react";
import NewPasswordToken from "../../components/auth/NewPasswordToken";
import NewPasswordForm from "../../components/auth/NewPasswordForm";
import type { confirmToken } from "../../types";

export default function NewPasswordView() {
  const [token, setToken] = useState<confirmToken["token"]>("");
  const [isValidToken, setIsValidToken] = useState(false);

  return (
    <>
      {!isValidToken ? (
        <NewPasswordToken
          setValidToken={setIsValidToken}
          onTokenValidated={setToken}
        />
      ) : (
        <NewPasswordForm token={token} />
      )}
    </>
  );
}