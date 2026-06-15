"use client";

import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CustomerProfilePage() {
  const { data: session } = useSession();

  return (
    <div>
      <h2 className="text-xl font-semibold">Mon profil</h2>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Informations personnelles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Nom</Label>
            <Input defaultValue={session?.user?.name || ""} readOnly className="bg-zinc-50 dark:bg-zinc-900" />
          </div>
          <div className="space-y-2">
            <Label>Téléphone</Label>
            <Input defaultValue={session?.user?.phone || ""} readOnly className="bg-zinc-50 dark:bg-zinc-900" />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input defaultValue={session?.user?.email || ""} readOnly className="bg-zinc-50 dark:bg-zinc-900" />
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Pour modifier vos informations, veuillez contacter le support.
          </p>
          <Button variant="outline" disabled>Enregistrer</Button>
        </CardContent>
      </Card>
    </div>
  );
}
