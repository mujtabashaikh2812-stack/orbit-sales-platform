/**
 * Gmail API integration module
 * Handles cold outreach drafts and sending (with dry-run support)
 */

export const isDryRun = (): boolean => {
  return process.env.DRY_RUN_MODE !== "false";
};
