// src/services/WorkflowService.ts
import { supabase } from '../lib/supabase';
import { Workflow } from '../types/workflow.types';
import { v4 as uuidv4 } from 'uuid';

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
    
    return data.workflow as Workflow;
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
        ...workflowData,
      })
      .select()
      .single();

    if (error) throw error;
    return data as Workflow;
  }
}