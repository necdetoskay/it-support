import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>Welcome to IT Support Portal</CardTitle>
          <CardDescription>
            Manage your IT support tickets efficiently
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Link href="/auth/login">
            <Button className="w-full">Login</Button>
          </Link>
          <Link href="/auth/register">
            <Button variant="outline" className="w-full">Register</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
