// src/services/WorkflowService.ts
import { supabase } from '../lib/supabase';
import { Workflow } from '../types/workflow.types';
import { Tables } from '../lib/database.types';
import { v4 as uuidv4 } from 'uuid';

// Helper function to convert database workflow to app workflow
function convertDatabaseWorkflow(dbWorkflow: Tables['workflows']['Row']): Workflow {
  return {
    id: dbWorkflow.id,
    advisorId: dbWorkflow.advisor_id,
    title: dbWorkflow.title,
    sections: dbWorkflow.sections as WorkflowSection[],
    status: dbWorkflow.status,
    createdAt: new Date(dbWorkflow.created_at),
    updatedAt: new Date(dbWorkflow.updated_at)
  };
}

export class WorkflowService {
  static async getWorkflowByLinkId(linkId: string): Promise<Workflow> {
    const { data, error } = await supabase
      .from('workflow_links')
      .select(`
        *,
        workflow:workflows(*)
      `)
      .eq('id', linkId)
      .single();

    if (error) throw error;
    if (!data?.workflow) throw new Error('Workflow not found');
    
    return convertDatabaseWorkflow(data.workflow);
  }

  static async saveFormResponse(workflowId: string, sectionId: string, formData: any) {
    const { error } = await supabase
      .from('workflow_responses')
      .insert({
        workflow_id: workflowId,
        section_id: sectionId,
        data: formData,
      });

    if (error) throw error;
  }

  static async getWorkflowResponses(workflowId: string) {
    const { data, error } = await supabase
      .from('workflow_responses')
      .select('*')
      .eq('workflow_id', workflowId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  }

  static async createWorkflow(advisorId: string, workflowData: Partial<Workflow>) {
    const { data, error } = await supabase
      .from('workflows')
      .insert({
        id: uuidv4(),
        advisor_id: advisorId,
        title:workflowData.title,
        status:workflowData.status || 'draft',
        sections: workflowData.sections || []
      })
      .select()
      .single();

    if (error) throw error;
    return convertDatabaseWorkflow;
  }
}