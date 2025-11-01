import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AdminStatsCardProps {
  title: string;
  value: number;
  icon: ReactNode;
  className?: string;
}

export function AdminStatsCard({ title, value, icon, className }: AdminStatsCardProps) {
  return (
    <Card className={`luxury-card ${className || ""}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium font-montserrat text-muted-foreground">
          {title}
        </CardTitle>
        <div className="text-primary">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold font-playfair text-foreground">
          {value}
        </div>
      </CardContent>
    </Card>
  );
}