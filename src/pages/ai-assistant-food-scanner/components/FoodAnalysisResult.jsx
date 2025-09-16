import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const FoodAnalysisResult = ({ result, onSaveToHistory, onNewScan }) => {
  if (!result) return null;

  const nutritionData = [
    { 
      label: 'Calories', 
      value: result?.calories || 0, 
      unit: 'kcal', 
      color: 'bg-primary',
      icon: 'Flame'
    },
    { 
      label: 'Protein', 
      value: result?.protein || 0, 
      unit: 'g', 
      color: 'bg-success',
      icon: 'Beef'
    },
    { 
      label: 'Carbs', 
      value: result?.carbohydrates || 0, 
      unit: 'g', 
      color: 'bg-warning',
      icon: 'Wheat'
    },
    { 
      label: 'Sugar', 
      value: result?.sugar || 0, 
      unit: 'g', 
      color: 'bg-accent',
      icon: 'Candy'
    },
    { 
      label: 'Fat', 
      value: result?.fat || 0, 
      unit: 'g', 
      color: 'bg-error',
      icon: 'Droplet'
    }
  ];

  const totalCalories = 400; // Daily target for progress calculation
  const caloriePercentage = Math.min((result?.calories / totalCalories) * 100, 100);

  return (
    <div className="space-y-6">
      {/* Food Identification */}
      <div className="text-center">
        <div className="w-24 h-24 bg-muted rounded-full mx-auto mb-4 overflow-hidden">
          {result?.image ? (
            <img 
              src={result?.image} 
              alt={result?.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Icon name="Utensils" size={32} className="text-muted-foreground" />
            </div>
          )}
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-1">
          {result?.name || 'Unknown Food'}
        </h3>
        <p className="text-sm text-muted-foreground">
          Serving size: {result?.servingSize || '100g'}
        </p>
        {result?.confidence && (
          <div className="flex items-center justify-center space-x-1 mt-2">
            <Icon name="CheckCircle" size={16} className="text-success" />
            <span className="text-xs text-success">
              {Math.round(result?.confidence * 100)}% confidence
            </span>
          </div>
        )}
      </div>
      {/* Calorie Overview */}
      <div className="bg-muted rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-foreground">Daily Calories</span>
          <span className="text-sm text-muted-foreground">
            {result?.calories} / {totalCalories} kcal
          </span>
        </div>
        <div className="w-full bg-border rounded-full h-3">
          <div 
            className="bg-primary h-3 rounded-full transition-all duration-500"
            style={{ width: `${caloriePercentage}%` }}
          ></div>
        </div>
      </div>
      {/* Nutrition Breakdown */}
      <div className="grid grid-cols-2 gap-4">
        {nutritionData?.map((item, index) => (
          <div key={index} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center space-x-3 mb-2">
              <div className={`w-8 h-8 ${item?.color} rounded-lg flex items-center justify-center`}>
                <Icon name={item?.icon} size={16} color="white" />
              </div>
              <div>
                <p className="text-sm font-medium text-card-foreground">{item?.label}</p>
                <p className="text-xs text-muted-foreground">per serving</p>
              </div>
            </div>
            <p className="text-2xl font-bold text-card-foreground">
              {item?.value}
              <span className="text-sm font-normal text-muted-foreground ml-1">
                {item?.unit}
              </span>
            </p>
          </div>
        ))}
      </div>
      {/* Additional Information */}
      {result?.additionalInfo && (
        <div className="bg-card border border-border rounded-xl p-4">
          <h4 className="font-medium text-card-foreground mb-2 flex items-center space-x-2">
            <Icon name="Info" size={16} />
            <span>Additional Information</span>
          </h4>
          <div className="space-y-2 text-sm text-muted-foreground">
            {result?.additionalInfo?.allergens && (
              <p><strong>Allergens:</strong> {result?.additionalInfo?.allergens}</p>
            )}
            {result?.additionalInfo?.ingredients && (
              <p><strong>Ingredients:</strong> {result?.additionalInfo?.ingredients}</p>
            )}
            {result?.additionalInfo?.healthScore && (
              <div className="flex items-center space-x-2">
                <strong>Health Score:</strong>
                <div className="flex space-x-1">
                  {[...Array(5)]?.map((_, i) => (
                    <Icon 
                      key={i}
                      name="Star" 
                      size={14} 
                      className={i < result?.additionalInfo?.healthScore ? 'text-warning' : 'text-muted'}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Action Buttons */}
      <div className="flex space-x-3">
        <Button
          variant="outline"
          onClick={onNewScan}
          iconName="Camera"
          iconPosition="left"
          className="flex-1"
        >
          Scan Again
        </Button>
        <Button
          onClick={() => onSaveToHistory(result)}
          iconName="Save"
          iconPosition="left"
          className="flex-1"
        >
          Save to History
        </Button>
      </div>
      {/* Recommendations */}
      <div className="bg-success/10 border border-success/20 rounded-xl p-4">
        <h4 className="font-medium text-success mb-2 flex items-center space-x-2">
          <Icon name="Lightbulb" size={16} />
          <span>AI Recommendation</span>
        </h4>
        <p className="text-sm text-success/80">
          {result?.recommendation || 
            `This food provides ${result?.calories} calories. Consider pairing with vegetables for a balanced meal. Great source of ${result?.protein > 10 ? 'protein' : result?.carbohydrates > 20 ? 'carbohydrates' : 'nutrients'}.`
          }
        </p>
      </div>
    </div>
  );
};

export default FoodAnalysisResult;