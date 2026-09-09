import React from "react";
import ComingSoon from "../../components/ComingSoon.jsx";

export default function AdminAssistanceList() {
  return (
    <ComingSoon
      title="Assistance requests"
      stageNote="Assistance request moderation will appear here when the assistance API is enabled."
    />
  );
}
import React, { useEffect, useState } from "react";
import { api } from "../../services/api";
import { REQUEST_STATUSES, badgeForStatus } from "../../utils/assistanceOptions";

export default function AdminAssistanceList() {
  return (
    <ComingSoon
      title="Assistance requests"
      stageNote="Assistance request moderation will appear here when the assistance API is enabled."
    />
  );
}
