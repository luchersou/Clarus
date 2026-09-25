import { ProfileSection } from "./_components/profile-section";
import { EmailSection } from "./_components/email-section";
import { PasswordSection } from "./_components/password-section";
import { ConnectedAccountsSection } from "./_components/connected-accounts-section";
import { SessionsSection } from "./_components/sessions-section";
import { DangerZone } from "./_components/danger-zone";

export default function SettingsPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account, security, and connected services.
        </p>
      </div>

      <ProfileSection />
      <EmailSection />
      <PasswordSection />
      <ConnectedAccountsSection />
      <SessionsSection />
      <DangerZone />
    </div>
  );
}