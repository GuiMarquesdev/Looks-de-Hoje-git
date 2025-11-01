import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatsCard({ title, value, icon, trend, className }: StatsCardProps) {
  return (
    <Card className={`shadow-card border-0 ${className || ""}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium font-body text-muted-foreground">
          {title}
        </CardTitle>
        <div className="text-muted-foreground">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold font-display text-foreground">
          {value}
        </div>
        {trend && (
          <div className="flex items-center text-xs text-muted-foreground mt-1">
            {trend.isPositive ? (
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
            )}
            <span className={trend.isPositive ? "text-green-500" : "text-red-500"}>
              +{trend.value}%
            </span>
            <span className="ml-1">desde o mês passado</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}