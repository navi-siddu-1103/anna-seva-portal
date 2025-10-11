"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, Loader2 } from "lucide-react"
import { getPersonalizedRecommendations } from "@/ai/flows/personalized-grocery-recommendations"
import { purchaseHistory, regionalAvailability } from "@/lib/data"
import { useToast } from "@/hooks/use-toast"

export default function PersonalizedSuggestions() {
  const [recommendations, setRecommendations] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleGetSuggestions = async () => {
    setIsLoading(true)
    setRecommendations("")
    try {
      const result = await getPersonalizedRecommendations({
        purchaseHistory: JSON.stringify(purchaseHistory),
        regionalAvailability: JSON.stringify(regionalAvailability),
        currentSeason: "Monsoon",
      })
      if (result.recommendations) {
        setRecommendations(result.recommendations)
      }
    } catch (error) {
      console.error("Failed to get recommendations:", error)
      toast({
        title: "Error",
        description: "Could not fetch personalized suggestions. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="text-primary" />
          Personalized Suggestions
        </CardTitle>
        <CardDescription>
          AI-powered recommendations based on your purchase history and seasonal availability.
        </CardDescription>
      </CardHeader>
      <CardContent className="min-h-[100px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : recommendations ? (
          <p className="text-sm text-foreground">{recommendations}</p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Click the button below to generate your personalized grocery suggestions.
          </p>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleGetSuggestions} disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Get Suggestions
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
