import React from "react";
import { RegisterClinic } from "./RegisterClinic";

export function Signup({ onSignupSuccess }) {
  return <RegisterClinic onRegisterSuccess={onSignupSuccess} />;
}
