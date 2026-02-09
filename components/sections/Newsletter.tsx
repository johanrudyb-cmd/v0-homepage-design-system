"use client"

import React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, CheckCircle, Sparkles } from "lucide-react"

export function Newsletter() {
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send the email to your backend
    setIsSubmitted(true)
  }

  return (
    <section className="bg-gold py-12 sm:py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl min-w-0 text-center">
          {/* Icon */}
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-black">
            <Mail className="h-6 w-6 text-gold" />
          </div>

          {/* Heading */}
          <h2 className="text-3xl font-bold tracking-tight text-black md:text-4xl text-balance">
            Rejoignez la communauté
          </h2>
          <p className="mt-4 text-lg text-black/70">
            Recevez chaque semaine nos meilleurs contenus, conseils exclusifs et actualités du monde de la mode directement dans votre boîte mail.
          </p>

          {/* Form */}
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4 sm:flex-row sm:gap-3">
              <Input
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 flex-1 border-black/20 bg-white text-black placeholder:text-black/40 focus-visible:ring-black"
              />
              <Button
                type="submit"
                size="lg"
                className="h-12 bg-black text-white hover:bg-black/80 font-semibold px-8"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                S&apos;inscrire
              </Button>
            </form>
          ) : (
            <div className="mt-8 flex items-center justify-center gap-3 rounded-lg bg-black/10 p-4">
              <CheckCircle className="h-6 w-6 text-black" />
              <p className="font-medium text-black">
                Merci ! Vous recevrez bientôt nos actualités.
              </p>
            </div>
          )}

          {/* Trust */}
          <p className="mt-6 text-sm text-black/60">
            Rejoignez plus de 5 000 abonnés. Pas de spam, désabonnement en un clic.
          </p>
        </div>
      </div>
    </section>
  )
}
