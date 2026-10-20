import Link from "next/link"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileQuestion, Home } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-muted/20 flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        <Card className="shadow-lg border-border text-center">
          <CardHeader className="pb-3">
            <div className="mx-auto size-12 rounded-xl bg-muted text-muted-foreground flex items-center justify-center mb-2 shadow-xs">
              <FileQuestion className="size-6 text-primary" />
            </div>
            <CardTitle className="text-xl font-bold tracking-tight text-foreground">
              404 • Page Not Found
            </CardTitle>
            <CardDescription className="text-xs">
              The requested page does not exist or has been moved.
            </CardDescription>
          </CardHeader>

          <CardContent className="text-xs text-muted-foreground">
            Please check the URL in your address bar or return to your dashboard.
          </CardContent>

          <CardFooter className="border-t border-border pt-4 pb-4 flex justify-center gap-2">
            <Link href="/">
              <Button size="sm" className="text-xs gap-1.5">
                <Home className="h-3.5 w-3.5" />
                Return Home
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
