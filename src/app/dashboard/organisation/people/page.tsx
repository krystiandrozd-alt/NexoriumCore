'use client';

// TelEnvIQ - People Page
// People registry

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PillarHeader } from '@/components/navigation';
import {
  Users,
  Plus,
  Search,
  Loader2,
  Mail,
  Building,
  UserCircle,
} from 'lucide-react';

interface Person {
  id: string;
  email: string;
  displayName: string;
  department?: string;
  team?: string;
  role?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'EXTERNAL';
  _count?: {
    raciMappings: number;
  };
}

const statusColors = {
  ACTIVE: 'bg-green-100 text-green-700',
  INACTIVE: 'bg-slate-100 text-slate-700',
  EXTERNAL: 'bg-blue-100 text-blue-700',
};

export default function PeoplePage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPeople();
  }, []);

  async function fetchPeople() {
    try {
      const response = await fetch('/api/organisation/people');
      const result = await response.json();
      if (result.success) {
        setPeople(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch people:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredPeople = people.filter(
    (p) =>
      p.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PillarHeader
        title="People"
        description="Manage the people registry for ownership and accountability"
        icon={Users}
        iconColor="text-indigo-600"
        actions={
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Person
          </Button>
        }
      />

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* People Grid */}
      {filteredPeople.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Users className="h-12 w-12 mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              {searchQuery ? 'No people match your search' : 'No people registered'}
            </h3>
            <p className="text-slate-500 mb-4">
              {searchQuery ? 'Try a different search term' : 'Add people to assign ownership and RACI roles'}
            </p>
            {!searchQuery && (
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add First Person
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPeople.map((person) => (
            <Card key={person.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start gap-3">
                  <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                    <UserCircle className="h-8 w-8 text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base truncate">
                      {person.displayName}
                    </CardTitle>
                    <Badge variant="secondary" className={statusColors[person.status]}>
                      {person.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{person.email}</span>
                  </div>
                  {person.department && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Building className="h-4 w-4" />
                      <span>
                        {person.department}
                        {person.team && ` / ${person.team}`}
                      </span>
                    </div>
                  )}
                  {person.role && (
                    <div className="text-slate-500">{person.role}</div>
                  )}
                </div>
                {person._count && (
                  <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
                    {person._count.raciMappings} RACI assignments
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
