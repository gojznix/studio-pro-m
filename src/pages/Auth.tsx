import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const authSchema = z.object({
  email: z.string().email("Vnesite veljaven e-poštni naslov"),
  password: z.string().min(6, "Geslo mora imeti vsaj 6 znakov"),
});

type AuthForm = z.infer<typeof authSchema>;

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors } } = useForm<AuthForm>({
    resolver: zodResolver(authSchema),
  });

  const onSubmit = async (values: AuthForm) => {
    setIsLoading(true);
    try {
      let result;
      if (isSignUp) {
        result = await supabase.auth.signUp({ email: values.email, password: values.password });
      } else {
        result = await supabase.auth.signInWithPassword({ email: values.email, password: values.password });
      }

      if (result.error) {
        toast({
          title: "Napaka",
          description: result.error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: isSignUp ? "Račun ustvarjen" : "Uspešna prijava",
          description: isSignUp ? "Preverite e-pošto za potrditev." : "Dobrodošli nazaj.",
        });
        navigate("/");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-72px)] flex items-center justify-center p-4 bg-zinc-950">
      <Card className="w-full max-w-md bg-zinc-900 border-zinc-700/50">
        <CardHeader>
          <CardTitle className="text-white">{isSignUp ? "Ustvari račun" : "Prijava"}</CardTitle>
          <CardDescription className="text-white/60">
            {isSignUp ? "Registrirajte se za dostop do administracije." : "Vpišite se v svoj račun."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/80">E-pošta</Label>
              <Input
                id="email"
                type="email"
                placeholder="ime@primer.si"
                {...register("email")}
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-white/40"
              />
              {errors.email && <p className="text-sm text-red-400">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white/80">Geslo</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••"
                {...register("password")}
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-white/40"
              />
              {errors.password && <p className="text-sm text-red-400">{errors.password.message}</p>}
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isSignUp ? "Registracija" : "Prijava"}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setIsSignUp((prev) => !prev)}
              className="text-sm text-green-400 hover:underline"
            >
              {isSignUp ? "Že imate račun? Prijavite se" : "Nimate računa? Registrirajte se"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
