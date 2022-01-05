import { useEffect, useState } from "react";
import { AddressZero } from "@ethersproject/constants";

import { LiquityStoreState } from "@liquity/lib-base";
import { useLiquitySelector } from "@liquity/lib-react";

import { useLiquity } from "../hooks/LiquityContext";

import { Dashboard } from "./Dashboard";
/* eslint-disable @typescript-eslint/no-unused-vars */
import { UnregisteredFrontend } from "./UnregisteredFrontend";
import { FrontendRegistration } from "./FrontendRegistration";
import { FrontendRegistrationSuccess } from "./FrontendRegistrationSuccess";
/* eslint-enable @typescript-eslint/no-unused-vars */

const selectFrontend = ({ frontend }: LiquityStoreState) => frontend;

export const PageSwitcher: React.FC = () => {
  const {
    /* eslint-disable @typescript-eslint/no-unused-vars */
    account,
    /* eslint-enable @typescript-eslint/no-unused-vars */
    config: { frontendTag }
  } = useLiquity();

  const frontend = useLiquitySelector(selectFrontend);
  const unregistered = frontendTag !== AddressZero && frontend.status === "unregistered";
  // console.log("frontendTag=" + frontendTag);

  /* eslint-disable @typescript-eslint/no-unused-vars */
  const [registering, setRegistering] = useState(false);
  /* eslint-enable @typescript-eslint/no-unused-vars */

  useEffect(() => {
    if (unregistered) {
      setRegistering(true);
    }
  }, [unregistered]);

  return <Dashboard />;

  // REGISTRATION TURNED OFF FOR DEV TESTING, TURN IT ON AGAIN LATER FOR ANY DEPLOYMENT
  /*   
  if (registering || unregistered) {
    if (frontend.status === "registered") {
      return <FrontendRegistrationSuccess onDismiss={() => setRegistering(false)} />;
    } else if (account === frontendTag) {
      return <FrontendRegistration />;
    } else {
      return <UnregisteredFrontend />;
    }
  } else {
    return <Dashboard />;
  } */
};
