import { Card, CardContent } from "@/components/ui/card"
import { SignUpForm } from "../components/signup-form"

export default function SignUpPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <div className="flex flex-col gap-6">
          <Card className="overflow-hidden p-0 h-[80vh]">
            <CardContent className="grid p-0 md:grid-cols-2 items-center h-full">
              <SignUpForm />
              <div className="relative hidden bg-muted md:block h-full">  
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-primaryflex items-center justify-center">
                  <div className="text-left text-primary-foreground px-8 py-40">
                    
                    <h2 className="text-4xl font-bold mb-4">Join thousands <br /> of businesses</h2>
                    <p className="text-blue-100 mb-6 text-sm">
                      Streamline your inventory management with powerful analytics, real-time tracking, and automated
                      workflows.
                    </p>
                    <div className="space-y-3 text-left">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-xs">Real-time inventory tracking</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-xs">Advanced analytics & reporting</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-xs">Automated low-stock alerts</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-xs">Multi-location support</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
            By creating an account, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
            .
          </div>
        </div>
      </div>
    </div>
  )
}
