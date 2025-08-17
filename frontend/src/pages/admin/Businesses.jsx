import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, CheckCircle, XCircle, Clock, Mail, Phone, MapPin } from 'lucide-react';
import { getBusinesses, updateBusinessStatus } from '@/api/business';

export default function AdminBusinesses() {
  const queryClient = useQueryClient();

  const { data: businesses = [], isLoading } = useQuery({
    queryKey: ['admin-businesses'],
    queryFn: getBusinesses,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ businessId, status }) => updateBusinessStatus(businessId, status),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-businesses']);
    },
  });

  const handleStatusUpdate = (businessId, status) => {
    updateStatusMutation.mutate({ businessId, status });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      active: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      suspended: { color: 'bg-red-100 text-red-800', icon: XCircle },
      inactive: { color: 'bg-gray-100 text-gray-800', icon: XCircle }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {status}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Business Management</h1>
          <p className="text-gray-600">Manage business registrations and approvals</p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {['pending', 'active', 'suspended', 'inactive'].map((status) => {
          const count = businesses.filter(b => b.status === status).length;
          return (
            <Card key={status}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 capitalize">{status}</p>
                    <p className="text-2xl font-bold text-gray-900">{count}</p>
                  </div>
                  {getStatusBadge(status)}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Business List */}
      <div className="grid gap-6">
        {businesses.map((business) => (
          <Card key={business._id} className="overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Building2 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{business.name}</CardTitle>
                    <CardDescription className="capitalize">
                      {business.businessType} • License: {business.licenseNumber}
                    </CardDescription>
                  </div>
                </div>
                {getStatusBadge(business.status)}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2" />
                    {business.email}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    {business.phone}
                  </div>
                </div>
                
                {business.address && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Address</p>
                    <p className="text-sm text-gray-900">
                      {[
                        business.address.street,
                        business.address.city,
                        business.address.state,
                        business.address.zipCode
                      ].filter(Boolean).join(', ')}
                    </p>
                  </div>
                )}
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Registration Date</p>
                  <p className="text-sm text-gray-900">
                    {new Date(business.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              {business.status === 'pending' && (
                <div className="flex space-x-2 pt-4 border-t">
                  <Button
                    size="sm"
                    onClick={() => handleStatusUpdate(business._id, 'active')}
                    disabled={updateStatusMutation.isLoading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleStatusUpdate(business._id, 'inactive')}
                    disabled={updateStatusMutation.isLoading}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              )}

              {business.status === 'active' && (
                <div className="flex space-x-2 pt-4 border-t">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusUpdate(business._id, 'suspended')}
                    disabled={updateStatusMutation.isLoading}
                  >
                    Suspend
                  </Button>
                </div>
              )}

              {business.status === 'suspended' && (
                <div className="flex space-x-2 pt-4 border-t">
                  <Button
                    size="sm"
                    onClick={() => handleStatusUpdate(business._id, 'active')}
                    disabled={updateStatusMutation.isLoading}
                  >
                    Reactivate
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {businesses.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No businesses found</h3>
            <p className="text-gray-600">No business registrations have been submitted yet.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
