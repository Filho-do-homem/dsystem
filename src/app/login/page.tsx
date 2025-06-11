
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

const loginSchema = z.object({
  username: z.string().min(1, "Nome de usuário é obrigatório"),
  password: z.string().min(1, "Senha é obrigatória"),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

const DSIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 60 60"
    xmlns="http://www.w3.org/2000/svg"
    stroke="currentColor"
    strokeWidth="4.5"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M15 8 V 52 H30 C45 52 50 42 50 30 C50 18 45 8 30 8 H15 Z" />
    <path d="M25 21 H34 Q37 21 37 24 V26 Q37 29 34 29 H28 Q25 29 25 32 V34 Q25 37 28 37 H37" />
    <path d="M49 5 h5 v5 h-5 Z" />
  </svg>
);


export default function LoginPage() {
  const { login, isAuthenticated, isLoading: isAuthLoading } = useAuth();
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
    // !!! PROTOTYPE ONLY - INSECURE AUTHENTICATION !!!
    // Esta lógica de login depende de validação no lado do cliente e credenciais
    // fixas no código definidas em AuthContext.
    // Isso NÃO É SEGURO para um ambiente de produção.
    // Aplicações reais exigem autenticação e validação robustas no lado do servidor.
    setIsSubmitting(true);
    const success = await login(data.username, data.password);
    if (success) {
      router.replace("/dashboard");
    } else {
      toast({
        variant: "destructive",
        title: "Falha no Login",
        description: "Nome de usuário ou senha incorretos.",
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
              <Label htmlFor="username">Admin</Label>
              <Input
                id="username"
                type="text"
                placeholder="Seu nome de usuário"
                {...register("username")}
                className={errors.username ? "border-destructive" : ""}
                disabled={isSubmitting}
              />
              {errors.username && (
                <p className="text-sm text-destructive">{errors.username.message}</p>
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
