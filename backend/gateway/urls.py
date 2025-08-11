from django.urls import path
from . import views

urlpatterns = [
    path('payment/<int:inscricao_id>/', views.gateway_payment, name='gateway_payment'),
    path('process/<int:inscricao_id>/', views.process_payment, name='process_payment'),
    path('success/<int:inscricao_id>/', views.payment_success, name='payment_success'),
    path('error/<int:inscricao_id>/', views.payment_error, name='payment_error'),
]
