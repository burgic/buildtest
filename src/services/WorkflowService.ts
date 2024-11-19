// src/services/WorkflowService.ts
import { WorkflowSection } from '../types/workflow.types';


interface Workflow {
  id: string;
  title: string;
  advisor_id: string;
  status: 'draft' | 'active' | 'completed' | 'archived';
  sections: WorkflowSection[];
  created_at?: string;
  updated_at?: string;
}

export class WorkflowService {
  static async getWorkflow(id: string): Promise<Workflow> {
    const { data, error } = await supabase
      .from('workflows')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  static async saveFormResponse(
    workflowId: string, 
    sectionId: string, 
    data: Record<string, any>
  ): Promise<void> {
    const { error } = await supabase
      .from('form_responses')
      .insert({
        workflow_id: workflowId,
        section_id: sectionId,
        data
      });

    if (error) throw error;
  }


  static async getFormResponses(workflowId: string) {
    const { data, error } = await supabase
      .from('form_responses')
      .select('*')
      .eq('workflow_id', workflowId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  }

  static async getWorkflow(workflowId: string): Promise<Workflow> {
    const { data, error } = await supabase
      .from('workflows')
      .select('*')
      .eq('id', workflowId)
      .single();

    if (error) throw error;
    return data;
  }

  static async updateWorkflow(workflowId: string, updates: Partial<Workflow>) {
    const { data, error } = await supabase
      .from('workflows')
      .update(updates)
      .eq('id', workflowId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}