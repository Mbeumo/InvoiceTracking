import React, { useState, useEffect } from 'react';
import { Workflow, Users, Clock, CheckCircle, AlertTriangle, Settings, Play } from 'lucide-react';
import { WorkflowAutomationService, WorkflowResult } from '../services/aiService';
import Card from './Card';

interface AIWorkflowAutomationProps {
  invoiceData?: any;
  onWorkflowTriggered?: (workflow: WorkflowResult) => void;
}

const AIWorkflowAutomation: React.FC<AIWorkflowAutomationProps> = ({ 
  invoiceData, 
  onWorkflowTriggered 
}) => {
  const [processing, setProcessing] = useState(false);
  const [workflows, setWorkflows] = useState<WorkflowResult[]>([]);
  const [activeWorkflows, setActiveWorkflows] = useState<any[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowResult | null>(null);

  useEffect(() => {
    if (invoiceData) {
      analyzeWorkflows();
    }
    loadActiveWorkflows();
  }, [invoiceData]);

  const analyzeWorkflows = async () => {
    try {
      setProcessing(true);
      const workflowResults = await WorkflowAutomationService.routeApproval(invoiceData);
      setWorkflows([workflowResults]);
      onWorkflowTriggered?.(workflowResults);
    } catch (error) {
      console.error('Failed to analyze workflows:', error);
    } finally {
      setProcessing(false);
    }
  };

  const loadActiveWorkflows = async () => {
    // Mock active workflows - replace with actual API call
    setActiveWorkflows([
      {
        id: 'wf-001',
        name: 'Standard Invoice Approval',
        status: 'active',
        currentStep: 'Manager Review',
        assignee: 'John Smith',
        dueDate: '2024-01-20',
        priority: 'medium'
      },
      {
        id: 'wf-002',
        name: 'High Value Purchase',
        status: 'pending',
        currentStep: 'Finance Director Approval',
        assignee: 'Sarah Johnson',
        dueDate: '2024-01-18',
        priority: 'high'
      }
    ]);
  };

  const triggerWorkflow = async (workflowType: string) => {
    try {
      setProcessing(true);
      const result = await WorkflowAutomationService.routeApproval({
        ...invoiceData,
        workflowType
      });
      setWorkflows(prev => [...prev, result]);
    } catch (error) {
      console.error('Failed to trigger workflow:', error);
    } finally {
      setProcessing(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900';
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-blue-600 bg-blue-100 dark:bg-blue-900';
      case 'pending': return 'text-orange-600 bg-orange-100 dark:bg-orange-900';
      case 'completed': return 'text-green-600 bg-green-100 dark:bg-green-900';
      case 'rejected': return 'text-red-600 bg-red-100 dark:bg-red-900';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900';
    }
  };

  return (
    <Card title="AI Workflow Automation">
      <div className="space-y-6">
        {/* Processing Status */}
        {processing && (
          <div className="bg-purple-50 dark:bg-purple-900 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
              <div>
                <h4 className="font-medium text-purple-900 dark:text-purple-100">
                  AI Analyzing Workflow
                </h4>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  Determining optimal approval route and priority scoring...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Recommended Workflows */}
        {workflows.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 dark:text-gray-100">
              AI Recommended Workflows
            </h4>
            {workflows.map((workflow, index) => (
              <div
                key={index}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <Workflow className="w-5 h-5 text-purple-600" />
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-gray-100">
                        {workflow.workflowType || 'Standard Approval'}
                      </h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Priority Score: {workflow.priorityScore}/100
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(workflow.priority || 'medium')}`}>
                      {(workflow.priority || 'medium').toUpperCase()}
                    </span>
                    <button
                      onClick={() => setSelectedWorkflow(selectedWorkflow?.workflowType === workflow.workflowType ? null : workflow)}
                      className="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                    >
                      {selectedWorkflow?.workflowType === workflow.workflowType ? 'Hide' : 'View'} Details
                    </button>
                  </div>
                </div>

                {/* Workflow Steps */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {workflow.approvalSteps?.map((step, stepIndex) => (
                    <div key={stepIndex} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-purple-600">{stepIndex + 1}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{step.role}</span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{step.assignee}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">Est. {step.estimatedTime}</p>
                    </div>
                  ))}
                </div>

                {/* Expanded Details */}
                {selectedWorkflow?.workflowType === workflow.workflowType && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h6 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Automation Rules</h6>
                        <ul className="space-y-1 text-sm">
                          {workflow.automationRules?.map((rule, ruleIndex) => (
                            <li key={ruleIndex} className="flex items-center space-x-2">
                              <CheckCircle className="w-3 h-3 text-green-600" />
                              <span className="text-gray-700 dark:text-gray-300">{rule}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h6 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Estimated Timeline</h6>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Total Duration:</span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">{workflow.estimatedDuration}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Auto-approval:</span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                              {workflow.canAutoApprove ? 'Eligible' : 'Not eligible'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex space-x-3">
                      <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
                        Start Workflow
                      </button>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                        Customize
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => triggerWorkflow('standard')}
            disabled={processing}
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-300 transition-colors text-left disabled:opacity-50"
          >
            <div className="flex items-center space-x-3">
              <Play className="w-6 h-6 text-blue-600" />
              <div>
                <h5 className="font-medium text-gray-900 dark:text-gray-100">Standard Approval</h5>
                <p className="text-sm text-gray-600 dark:text-gray-400">Manager → Finance</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => triggerWorkflow('expedited')}
            disabled={processing}
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-orange-300 transition-colors text-left disabled:opacity-50"
          >
            <div className="flex items-center space-x-3">
              <Clock className="w-6 h-6 text-orange-600" />
              <div>
                <h5 className="font-medium text-gray-900 dark:text-gray-100">Expedited</h5>
                <p className="text-sm text-gray-600 dark:text-gray-400">Fast-track approval</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => triggerWorkflow('high_value')}
            disabled={processing}
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-red-300 transition-colors text-left disabled:opacity-50"
          >
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <div>
                <h5 className="font-medium text-gray-900 dark:text-gray-100">High Value</h5>
                <p className="text-sm text-gray-600 dark:text-gray-400">Executive approval</p>
              </div>
            </div>
          </button>
        </div>

        {/* Active Workflows */}
        {activeWorkflows.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 dark:text-gray-100">
              Active Workflows
            </h4>
            <div className="space-y-3">
              {activeWorkflows.map((workflow) => (
                <div
                  key={workflow.id}
                  className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Users className="w-5 h-5 text-gray-600" />
                      <div>
                        <h5 className="font-medium text-gray-900 dark:text-gray-100">
                          {workflow.name}
                        </h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {workflow.currentStep} • Assigned to {workflow.assignee}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(workflow.priority)}`}>
                        {workflow.priority.toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(workflow.status)}`}>
                        {workflow.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Due: {workflow.dueDate}</span>
                    <button className="text-blue-600 hover:text-blue-700 font-medium">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Workflow Settings */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Settings className="w-5 h-5 text-gray-600" />
              <div>
                <h5 className="font-medium text-gray-900 dark:text-gray-100">Automation Settings</h5>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Configure automatic approval rules and thresholds
                </p>
              </div>
            </div>
            <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm">
              Configure
            </button>
          </div>
        </div>

        {/* No Data State */}
        {!invoiceData && !processing && workflows.length === 0 && (
          <div className="text-center py-8">
            <Workflow className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Ready for Automation
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Upload or select an invoice to get AI-powered workflow recommendations
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default AIWorkflowAutomation;
