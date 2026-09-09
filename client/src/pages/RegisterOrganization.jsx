import React from "react";
import ComingSoon from "../components/ComingSoon.jsx";

export default function RegisterOrganization() {
  return (
    <ComingSoon
      title="Register an organization"
      stageNote="Organization registration is not available until the organization API is enabled."
    />
  );
}
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { ORG_TYPES, ASSISTANCE_CATEGORIES } from "../utils/organizationOptions";

const fieldStyle = {
  width: "100%", padding: "0.6rem 0.8rem", border: "1px solid var(--line)",
  borderRadius: "4px", fontSize: "0.95rem", fontFamily: "var(--font-body)",
};
const labelStyle = { display: "block", fontWeight: 600, marginBottom: "0.35rem", fontSize: "0.9rem" };
const wrap = { marginBottom: "1.1rem" };

const EMPTY = {
  name: "", type: ORG_TYPES[0], description: "", email: "", password: "", confirmPassword: "",
  phone: "", website: "", address: "", operating_areas: "",
  registration_info: "", documents: "", representative_name: "", representative_contact: "",
};

export default function RegisterOrganization() {
  return (
    <ComingSoon
      title="Register an organization"
      stageNote="Organization registration is not available until the organization API is enabled."
    />
  );
}
