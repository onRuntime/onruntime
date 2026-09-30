"use client";

import React from "react";

declare global {
  interface Window {
    gtag?: (
      command: string,
      eventName: string,
      params: Record<string, unknown>
    ) => void;
  }
}

interface GoogleAdsConversionLinkProps {
  href: string;
  sendTo: string;
  children: React.ReactNode;
}

/**
 * Link that reports a Google Ads conversion on click.
 *
 * The conversion is sent alongside the navigation rather than before it. An
 * earlier version called `preventDefault` and waited for `event_callback`,
 * falling back to a 1000 ms timer: visitors stared at a frozen button for up to
 * a second on the main call to action, and cmd+click could no longer open the
 * link in a new tab because the default was cancelled. `beacon` transport is
 * built to outlive the page it was fired from, so blocking buys nothing.
 *
 * @param href - The destination URL
 * @param sendTo - The Google Ads conversion ID (format: AW-XXXXXXXXX/XXXXXXXXXX)
 */
export const GoogleAdsConversionLink: React.FC<GoogleAdsConversionLinkProps> = ({
  href,
  sendTo,
  children,
}) => {
  const handleClick = () => {
    // Guarded so local and preview clicks never reach the live conversion.
    if (process.env.NODE_ENV !== "production") return;

    window.gtag?.("event", "conversion", {
      send_to: sendTo,
      transport_type: "beacon",
    });
  };

  return (
    <a href={href} onClick={handleClick}>
      {children}
    </a>
  );
};
