import { motion } from "framer-motion";
import { TrendingUp, Users, Briefcase, Scale, GraduationCap, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

interface DepartmentCardProps {
  name: string;
  score: number;
}

const iconMap: Record<string, React.ReactNode> = {
  Sales: <TrendingUp className="w-5 h-5" />,
  Marketing: <Users className="w-5 h-5" />,
  Operations: <Briefcase className="w-5 h-5" />,
  Legal: <Scale className="w-5 h-5" />,
  "People Development": <GraduationCap className="w-5 h-5" />,
  "Accounts & Finance": <DollarSign className="w-5 h-5" />,
};

export const DepartmentCard = ({ name, score }: DepartmentCardProps) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ y: 8, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className="cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => navigate(`/department/${encodeURIComponent(name)}`)}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <span className="text-primary">{iconMap[name]}</span>
            {name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-primary">{Math.round(score)}%</div>
          <p className="text-xs text-muted-foreground mt-1">Department Average</p>
        </CardContent>
      </Card>
    </motion.div>
  );
};
