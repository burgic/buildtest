// src/services/WorkflowService.ts
import { supabase } from '../lib/supabase';
import { Workflow } from '../types/workflow.types';
import { Tables } from '../lib/database.types';
import { v4 as uuidv4 } from 'uuid';

interface Workflow {
  id: string;
  title: string;
  advisor_id: string;
  status: 'draft' | 'active' | 'completed' | 'archived';
  sections: any[];
  created_at?: string;
  updated_at?: string;
}

export class WorkflowService {
  static async createWorkflow(advisorId: string, title: string): Promise<Workflow> {
    const { data, error } = await supabase
      .from('workflows')
      .insert({
        advisor_id: advisorId,
        title: title,
        status: 'draft',
        sections: []
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating workflow:', error);
      throw error;
    }

    return data;
  }

  static async saveFormResponse(workflowId: string, sectionId: string, data: any) {
    console.log('Saving form response:', {
      workflow_id: workflowId,
      section_id: sectionId,
      data: data
    });

    try {
      const { data: response, error } = await supabase
        .from('form_responses')
        .insert({
          workflow_id: workflowId,
          section_id: sectionId,
          data: data
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving form response:', error);
        throw error;
      }

      console.log('Successfully saved form response:', response);
      return response;
    } catch (error) {
      console.error('Error in saveFormResponse:', error);
      throw error;
    }
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