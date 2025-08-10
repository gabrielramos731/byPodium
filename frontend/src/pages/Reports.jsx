import React, { useState, useEffect } from 'react';
import api from '../utils/api/Api';
import getAllEvents from '../utils/api/apiTaskManager';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, LineElement, PointElement } from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import styles from './Reports.module.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement
);

const Reports = () => {
  const [reportType, setReportType] = useState('event');
  const [eventId, setEventId] = useState('');
  const [userEvents, setUserEvents] = useState([]);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), 0, 1));
  const [endDate, setEndDate] = useState(new Date());
  const [selectedReportSubtype, setSelectedReportSubtype] = useState('summary');

  useEffect(() => {
    fetchUserEvents();
  }, []);

    const fetchUserEvents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/eventos/organizador/');
      setUserEvents(response.data);
    } catch (err) {
      setError('Erro ao carregar eventos do organizador');
    } finally {
      setLoading(false);
    }
  };

  const generateEventReport = async () => {
    if (!eventId) {
      setError('Selecione um evento');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await api.get(`/eventos/${eventId}/report/?type=${selectedReportSubtype}`);
      setReportData(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao gerar relatório');
    } finally {
      setLoading(false);
    }
  };

  const generatePeriodReport = async () => {
    try {
      setLoading(true);
      setError('');
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];
      
      const response = await api.get(`/eventos/period-report/?data_inicio=${startDateStr}&data_fim=${endDateStr}`);
      setReportData(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao gerar relatório');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = () => {
    if (reportType === 'event') {
      generateEventReport();
    } else {
      generatePeriodReport();
    }
  };

  const exportToCSV = () => {
    if (!reportData) return;

    let csvContent = '';
    let filename = '';

    if (reportType === 'event' && selectedReportSubtype === 'participants') {
      csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "Nome,Email,Kit,Status,Data Inscrição\n";
      
      reportData.participantes?.forEach(participant => {
        csvContent += `${participant.nome},${participant.email},${participant.kit},${participant.status},${participant.data_inscricao}\n`;
      });
      
      filename = `participantes_${reportData.evento}.csv`;
    } else if (reportType === 'period') {
      csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "Nome do Evento,Data,Total Inscritos,Status,Local\n";
      
      reportData.eventos?.forEach(event => {
        csvContent += `${event.nome},${event.data},${event.total_inscritos},${event.status},${event.local}\n`;
      });
      
      filename = `relatorio_periodo_${reportData.periodo?.inicio}_${reportData.periodo?.fim}.csv`;
    }

    if (csvContent) {
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const generateChartData = () => {
    if (!reportData) return null;

    if (reportType === 'event' && selectedReportSubtype === 'summary') {
      // Gráfico de pizza para status das inscrições
      const statusData = {
        labels: ['Confirmadas', 'Pendentes', 'Canceladas'],
        datasets: [{
          data: [
            reportData.status_inscricoes?.confirmadas || 0,
            reportData.status_inscricoes?.pendentes || 0,
            reportData.status_inscricoes?.canceladas || 0
          ],
          backgroundColor: ['#4CAF50', '#FFD700', '#1A1A1A'],
          borderColor: ['#4CAF50', '#FFD700', '#1A1A1A'],
          borderWidth: 2
        }]
      };

      // Gráfico de barras para categorias
      const categoriaLabels = Object.keys(reportData.categorias || {});
      const categoriaValues = Object.values(reportData.categorias || {});
      
      const categoriaData = {
        labels: categoriaLabels,
        datasets: [{
          label: 'Inscrições por Categoria',
          data: categoriaValues,
          backgroundColor: '#FFD700',
          borderColor: '#1A1A1A',
          borderWidth: 2
        }]
      };

      // Gráfico de barras para kits
      const kitLabels = Object.keys(reportData.kits || {});
      const kitValues = Object.values(reportData.kits || {});
      
      const kitData = {
        labels: kitLabels,
        datasets: [{
          label: 'Kits Selecionados',
          data: kitValues,
          backgroundColor: '#1A1A1A',
          borderColor: '#FFD700',
          borderWidth: 2
        }]
      };

      return { statusData, categoriaData, kitData };
    }

    if (reportType === 'period') {
      const eventLabels = reportData.eventos?.map(event => event.nome.substring(0, 20) + '...') || [];
      const eventValues = reportData.eventos?.map(event => event.total_inscritos) || [];
      
      const periodData = {
        labels: eventLabels,
        datasets: [{
          label: 'Total de Inscrições',
          data: eventValues,
          backgroundColor: '#FFD700',
          borderColor: '#1A1A1A',
          borderWidth: 2
        }]
      };

      return { periodData };
    }

    return null;
  };

  const chartData = generateChartData();

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#1A1A1A',
          font: {
            weight: 'bold'
          }
        }
      },
      title: {
        display: true,
        text: 'Dados do Relatório',
        color: '#1A1A1A',
        font: {
          size: 16,
          weight: 'bold'
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: '#1A1A1A'
        },
        grid: {
          color: '#E0E0E0'
        }
      },
      y: {
        ticks: {
          color: '#1A1A1A'
        },
        grid: {
          color: '#E0E0E0'
        }
      }
    }
  };

  return (
    <div className={styles.reportsContainer}>
      <div className={styles.header}>
        <h1>Relatórios de Eventos</h1>
        <p>Gere relatórios detalhados dos seus eventos</p>
      </div>

      <div className={styles.controls}>
        <div className={styles.reportTypeSelector}>
          <label>
            <input
              type="radio"
              value="event"
              checked={reportType === 'event'}
              onChange={(e) => setReportType(e.target.value)}
            />
            Relatório de Evento Específico
          </label>
          <label>
            <input
              type="radio"
              value="period"
              checked={reportType === 'period'}
              onChange={(e) => setReportType(e.target.value)}
            />
            Relatório por Período
          </label>
        </div>

        {reportType === 'event' && (
          <div className={styles.eventSelector}>
            <select
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              className={styles.select}
            >
              <option value="">Selecione um evento</option>
              {userEvents.map(event => (
                <option key={event.id} value={event.id}>
                  {event.nome} - {new Date(event.dataIni).toLocaleDateString('pt-BR')}
                </option>
              ))}
            </select>

            <div className={styles.subtypeSelector}>
              <label>
                <input
                  type="radio"
                  value="summary"
                  checked={selectedReportSubtype === 'summary'}
                  onChange={(e) => setSelectedReportSubtype(e.target.value)}
                />
                Resumo do Evento
              </label>
              <label>
                <input
                  type="radio"
                  value="participants"
                  checked={selectedReportSubtype === 'participants'}
                  onChange={(e) => setSelectedReportSubtype(e.target.value)}
                />
                Lista de Participantes
              </label>
            </div>
          </div>
        )}

        {reportType === 'period' && (
          <div className={styles.dateSelector}>
            <div className={styles.dateInput}>
              <label>Data Início:</label>
              <DatePicker
                selected={startDate}
                onChange={setStartDate}
                dateFormat="dd/MM/yyyy"
                className={styles.datePicker}
              />
            </div>
            <div className={styles.dateInput}>
              <label>Data Fim:</label>
              <DatePicker
                selected={endDate}
                onChange={setEndDate}
                dateFormat="dd/MM/yyyy"
                className={styles.datePicker}
              />
            </div>
          </div>
        )}

        <button
          onClick={handleGenerateReport}
          disabled={loading}
          className={styles.generateButton}
        >
          {loading ? 'Gerando...' : 'Gerar Relatório'}
        </button>
      </div>

      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      {reportData && (
        <div className={styles.reportResults}>
          <div className={styles.reportHeader}>
            <h2>
              {reportType === 'event' 
                ? `Relatório: ${reportData.evento?.nome || reportData.evento}` 
                : `Relatório do Período: ${reportData.periodo?.inicio} - ${reportData.periodo?.fim}`
              }
            </h2>
            <div className={styles.actions}>
              <button onClick={exportToCSV} className={styles.exportButton}>
                Exportar CSV
              </button>
              <span className={styles.generatedAt}>
                Gerado em: {reportData.data_geracao}
              </span>
            </div>
          </div>

          {/* Estatísticas Resumidas */}
          {reportType === 'event' && selectedReportSubtype === 'summary' && (
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <h3>Total de Inscritos</h3>
                <p className={styles.statValue}>{reportData.estatisticas?.total_inscritos || 0}</p>
              </div>
              <div className={styles.statCard}>
                <h3>Taxa de Ocupação</h3>
                <p className={styles.statValue}>{(reportData.estatisticas?.taxa_ocupacao || 0).toFixed(1)}%</p>
              </div>
              <div className={styles.statCard}>
                <h3>Vagas Disponíveis</h3>
                <p className={styles.statValue}>{reportData.estatisticas?.vagas_disponiveis || 0}</p>
              </div>
              <div className={styles.statCard}>
                <h3>Capacidade</h3>
                <p className={styles.statValue}>{reportData.evento?.capacidade || 0}</p>
              </div>
            </div>
          )}

          {reportType === 'period' && (
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <h3>Total de Eventos</h3>
                <p className={styles.statValue}>{reportData.total_eventos || 0}</p>
              </div>
              <div className={styles.statCard}>
                <h3>Total de Inscrições</h3>
                <p className={styles.statValue}>
                  {reportData.eventos?.reduce((sum, event) => sum + event.total_inscritos, 0) || 0}
                </p>
              </div>
            </div>
          )}

          {/* Gráficos */}
          {chartData && (
            <div className={styles.chartsContainer}>
              {reportType === 'event' && selectedReportSubtype === 'summary' && (
                <>
                  <div className={styles.chartCard}>
                    <h3>Status das Inscrições</h3>
                    <div className={styles.chartContainer}>
                      <Pie data={chartData.statusData} options={chartOptions} />
                    </div>
                  </div>
                  
                  {Object.keys(reportData.categorias || {}).length > 0 && (
                    <div className={styles.chartCard}>
                      <h3>Inscrições por Categoria</h3>
                      <div className={styles.chartContainer}>
                        <Bar data={chartData.categoriaData} options={chartOptions} />
                      </div>
                    </div>
                  )}
                  
                  {Object.keys(reportData.kits || {}).length > 0 && (
                    <div className={styles.chartCard}>
                      <h3>Kits Selecionados</h3>
                      <div className={styles.chartContainer}>
                        <Bar data={chartData.kitData} options={chartOptions} />
                      </div>
                    </div>
                  )}
                </>
              )}

              {reportType === 'period' && chartData.periodData && (
                <div className={styles.chartCard}>
                  <h3>Inscrições por Evento</h3>
                  <div className={styles.chartContainer}>
                    <Bar data={chartData.periodData} options={chartOptions} />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tabela de Participantes */}
          {reportType === 'event' && selectedReportSubtype === 'participants' && reportData.participantes && (
            <div className={styles.tableCard}>
              <h3>Lista de Participantes</h3>
              <div className={styles.tableContainer}>
                <table className={styles.participantsTable}>
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>Email</th>
                      <th>Kit</th>
                      <th>Status</th>
                      <th>Data de Inscrição</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.participantes.map((participant, index) => (
                      <tr key={index}>
                        <td>{participant.nome}</td>
                        <td>{participant.email}</td>
                        <td>{participant.kit}</td>
                        <td>
                          <span className={`${styles.status} ${styles[participant.status]}`}>
                            {participant.status}
                          </span>
                        </td>
                        <td>{participant.data_inscricao}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tabela de Eventos por Período */}
          {reportType === 'period' && reportData.eventos && (
            <div className={styles.tableCard}>
              <h3>Eventos no Período</h3>
              <div className={styles.tableContainer}>
                <table className={styles.eventsTable}>
                  <thead>
                    <tr>
                      <th>Nome do Evento</th>
                      <th>Data</th>
                      <th>Total de Inscritos</th>
                      <th>Status</th>
                      <th>Local</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.eventos.map((event, index) => (
                      <tr key={index}>
                        <td>{event.nome}</td>
                        <td>{event.data}</td>
                        <td>{event.total_inscritos}</td>
                        <td>
                          <span className={`${styles.status} ${styles[event.status === 'Finalizado' ? 'finalizado' : 'ativo']}`}>
                            {event.status}
                          </span>
                        </td>
                        <td>{event.local}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Reports;
