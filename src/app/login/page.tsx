
"use client";

import * as React from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

// Schema para o formulário de login.
// O Firebase Authentication espera um email, então mudamos de 'username' para 'email'.
const loginSchema = z.object({
  email: z.string().email("Email inválido").min(1, "Email é obrigatório"),
  password: z.string().min(1, "Senha é obrigatória"),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

const DSIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 60 60"
    xmlns="http://www.w3.org/2000/svg"
    stroke="currentColor"
    strokeWidth="4"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M38 8 H15 V52 H38 C50 52 55 42 55 30 C55 18 50 8 38 8 Z" />
    <path d="M23 21 S26 17 32 19 S35 26 30 28 S23 25 23 25 S25 31 30 33 S38 36 38 36 S34 43 27 41 S23 34 23 34" />
    <rect x="43" y="5" width="5" height="5" rx="1" strokeWidth="2.5" />
  </svg>
);


export default function LoginPage() {
  const { login, isAuthenticated, isLoading: isAuthLoading, user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  React.useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isAuthLoading, router]);

  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    // Comentário:
    // A lógica de login agora usa Firebase Authentication.
    // A validação de email/senha e a segurança da sessão são tratadas pelo Firebase.
    setIsSubmitting(true);
    const success = await login(data.email, data.password); // Usar data.email
    if (success) {
      // O redirecionamento é tratado pelo useEffect acima, mas podemos garantir aqui.
      router.replace("/dashboard");
    } else {
      toast({
        variant: "destructive",
        title: "Falha no Login",
        description: "Email ou senha incorretos. Por favor, tente novamente.",
      });
    }
    setIsSubmitting(false);
  };

  if (isAuthLoading || (!isAuthLoading && isAuthenticated)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-primary/30 via-background to-background p-4">
      <Card className="w-full max-w-sm shadow-2xl bg-card/90 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex items-center justify-center gap-2">
            <DSIcon className="h-10 w-10 text-primary" />
            <span className="text-3xl font-bold font-headline text-foreground">D'System</span>
          </div>
          <CardTitle className="text-2xl font-headline">Acesso Restrito</CardTitle>
          <CardDescription>Por favor, insira suas credenciais para continuar.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label> {/* Mudar para Email */}
              <Input
                id="email"
                type="email" // Mudar tipo para email
                placeholder="seu@email.com" // Placeholder de email
                {...register("email")} // Registrar como email
                className={errors.email ? "border-destructive" : ""}
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Sua senha"
                {...register("password")}
                className={errors.password ? "border-destructive" : ""}
                disabled={isSubmitting}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isSubmitting || isAuthLoading}>
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {isSubmitting ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </CardContent>
      </Card>
       <p className="mt-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} D'System. Todos os direitos reservados.
      </p>
    </div>
  );
}
