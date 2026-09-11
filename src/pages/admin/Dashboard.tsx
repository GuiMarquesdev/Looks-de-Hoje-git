import { Package, ShoppingBag, Calendar, TrendingUp } from "lucide-react";
import { StatsCard } from "@/components/admin/StatsCard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Dashboard() {
  // Mock data - will be replaced with real data from backend
  const stats = {
    totalPieces: 145,
    availablePieces: 102,
    rentedPieces: 43,
    monthlyRentals: 28,
  };

  const recentActivity = [
    { id: 1, action: "Vestido Azul Marinho alugado", time: "2 horas atrás" },
    {
      id: 2,
      action: "Nova peça 'Blazer Dourado' adicionada",
      time: "4 horas atrás",
    },
    { id: 3, action: "Saia Plissada devolvida", time: "1 dia atrás" },
    { id: 4, action: "Categoria 'Festa' atualizada", time: "2 dias atrás" },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">
          Bem-vinda ao Painel
        </h1>
        <p className="text-muted-foreground font-body mt-2">
          Aqui está um resumo da sua loja LooksdeHoje
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total de Peças"
          value={stats.totalPieces}
          icon={<Package />}
          trend={{ value: 12, isPositive: true }}
          className="hover:shadow-gold transition-shadow duration-300"
        />
        <StatsCard
          title="Peças Disponíveis"
          value={stats.availablePieces}
          icon={<ShoppingBag />}
          className="hover:shadow-gold transition-shadow duration-300"
        />
        <StatsCard
          title="Peças Alugadas"
          value={stats.rentedPieces}
          icon={<Calendar />}
          className="hover:shadow-gold transition-shadow duration-300"
        />
        <StatsCard
          title="Aluguéis do Mês"
          value={stats.monthlyRentals}
          icon={<TrendingUp />}
          trend={{ value: 8, isPositive: true }}
          className="hover:shadow-gold transition-shadow duration-300"
        />
      </div>

      {/* Charts and Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Availability Chart */}
        <Card className="shadow-card border-0">
          <CardHeader>
            <CardTitle className="font-display">
              Disponibilidade das Peças
            </CardTitle>
            <CardDescription className="font-body">
              Visão geral do status do seu estoque
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                  <span className="font-body text-sm">Disponíveis</span>
                </div>
                <span className="font-body font-semibold">
                  {stats.availablePieces}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-accent rounded-full"></div>
                  <span className="font-body text-sm">Alugadas</span>
                </div>
                <span className="font-body font-semibold">
                  {stats.rentedPieces}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 mt-4">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      (stats.availablePieces / stats.totalPieces) * 100
                    }%`,
                  }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="shadow-card border-0">
          <CardHeader>
            <CardTitle className="font-display">Atividade Recente</CardTitle>
            <CardDescription className="font-body">
              Últimas movimentações da sua loja
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-body text-foreground">
                      {activity.action}
                    </p>
                    <p className="text-xs text-muted-foreground font-body">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
