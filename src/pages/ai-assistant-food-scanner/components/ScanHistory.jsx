import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ScanHistory = ({ history = [], onReanalyze, onClearHistory }) => {
  const formatDate = (date) => {
    return new Date(date)?.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (history?.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="History" size={24} className="text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">No Scan History</h3>
        <p className="text-sm text-muted-foreground">
          Your food scans will appear here for quick access
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Recent Scans</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearHistory}
          iconName="Trash2"
          iconPosition="left"
          className="text-muted-foreground hover:text-destructive"
        >
          Clear
        </Button>
      </div>
      {/* History Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {history?.slice(0, 6)?.map((scan, index) => (
          <div
            key={scan?.id || index}
            className="bg-card border border-border rounded-xl p-4 hover:shadow-elevation-2 transition-shadow"
          >
            {/* Scan Image */}
            <div className="w-full h-32 bg-muted rounded-lg mb-3 overflow-hidden">
              {scan?.image ? (
                <img 
                  src={scan?.image} 
                  alt={scan?.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Icon name="Image" size={24} className="text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Scan Info */}
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <h4 className="font-medium text-card-foreground text-sm truncate">
                  {scan?.name || 'Unknown Food'}
                </h4>
                <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                  {formatDate(scan?.timestamp)}
                </span>
              </div>

              {/* Quick Stats */}
              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Icon name="Flame" size={12} />
                  <span>{scan?.calories || 0} cal</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Icon name="Beef" size={12} />
                  <span>{scan?.protein || 0}g</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Icon name="Wheat" size={12} />
                  <span>{scan?.carbohydrates || 0}g</span>
                </div>
              </div>

              {/* Scan Type Badge */}
              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  scan?.scanType === 'qr' ?'bg-success/10 text-success' :'bg-primary/10 text-primary'
                }`}>
                  <Icon 
                    name={scan?.scanType === 'qr' ? 'QrCode' : 'Camera'} 
                    size={10} 
                    className="mr-1"
                  />
                  {scan?.scanType === 'qr' ? 'QR Scan' : 'Food Scan'}
                </span>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onReanalyze(scan)}
                  className="text-xs h-6 px-2"
                >
                  View Details
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Show More Button */}
      {history?.length > 6 && (
        <div className="text-center">
          <Button variant="outline" size="sm">
            View All History ({history?.length} scans)
          </Button>
        </div>
      )}
      {/* Quick Stats Summary */}
      <div className="bg-muted rounded-xl p-4">
        <h4 className="font-medium text-foreground mb-3">Today's Summary</h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">
              {history?.reduce((sum, scan) => sum + (scan?.calories || 0), 0)}
            </p>
            <p className="text-xs text-muted-foreground">Total Calories</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-success">
              {history?.length}
            </p>
            <p className="text-xs text-muted-foreground">Foods Scanned</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-warning">
              {history?.reduce((sum, scan) => sum + (scan?.protein || 0), 0)}g
            </p>
            <p className="text-xs text-muted-foreground">Total Protein</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScanHistory;