from rest_framework import serializers
from .models import User, DiaryEntry, DassResult

# rules for info User (Onboarding(step 2 register)  Get Profile)
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'display_name', 'age', 'avatar', 'music_preferences']
        read_only_fields = ['id', 'username', 'email']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def create(self, validated_data):
        # create_user to auto hass pw (maybe improve late?)
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user

class DiaryEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = DiaryEntry
        fields = ['id', 'title', 'content', 'theme', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class DassResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = DassResult
        fields = ['id', 'stress_score', 'anxiety_score', 'depression_score', 
                  'stress_level', 'anxiety_level', 'depression_level', 'created_at']
        read_only_fields = ['id', 'created_at']