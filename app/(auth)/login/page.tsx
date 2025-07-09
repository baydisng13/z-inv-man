import { Card, CardContent } from "@/components/ui/card";
import { LoginForm } from "../components/login-form";
// import { cn } from "@/lib/utils"; // Unused
import Image from "next/image"; // Added for next/image

export default function LoginPage() {
  return (
    <div className="flex min-h-svh  flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-2xl  ">
        <div className={"flex flex-col gap-6"}>
          <Card className="overflow-hidden p-0 h-[90vh] ">
            <CardContent className="grid p-0 md:grid-cols-2 items-center h-full">
              <LoginForm />
              <div className="relative hidden bg-muted md:block h-full">
                <Image
                  src="/store.jpg"
                  alt="Image"
                  layout="fill"
                  objectFit="cover"
                  className="absolute inset-0 h-full w-full" // className might be redundant with layout="fill" but good for potential overrides
                />
              </div>
            </CardContent>
          </Card>
          <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
            By clicking continue, you agree to our{" "}
            <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
          </div>
        </div>
      </div>
    </div>
  );
}
