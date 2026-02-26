import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LoginForm } from "@/components/auth/login-form";
import { GoogleButton } from "@/components/auth/google-button";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
          <span className="text-xl font-bold text-primary-foreground">V</span>
        </div>
        <CardTitle className="text-2xl">Vector Auto</CardTitle>
        <CardDescription>Sign in to the admin dashboard</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error === "AdminOnly" && (
          <p className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive text-center">
            Access denied. Only admin accounts can sign in.
          </p>
        )}
        <LoginForm />
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>
        <GoogleButton />
      </CardContent>
    </Card>
  );
}
