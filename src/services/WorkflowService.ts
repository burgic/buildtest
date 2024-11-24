import { supabase } from '../lib/supabase';
import type { WorkflowSection } from '../types/workflow.types';
import { defaultSections } from '../config/WorkflowConfig';

export interface Workflow {
  id: string;
  title: string;
  advisor_id: string;
  sections: WorkflowSection[];
  status: 'draft' | 'active' | 'completed' | 'archived';
  created_at?: string;
  updated_at?: string;
}

export interface FormResponse {
  id: string;
  workflow_id: string;
  section_id: string;
  data: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface WorkflowLink {
  id: string;
  workflow_id: string;
  client_email: string;
  status: 'pending' | 'in_progress' | 'completed';
  expires_at: string;
  created_at: string;
}

export class WorkflowService {
  static async initializeClientWorkflow(userId: string, email: string): Promise<Workflow[]> {
    try {
      // First, check for existing active workflows
      const { data: existingWorkflows, error: workflowError } = await supabase
        .from('workflows')
        .select('*')
        .eq('advisor_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (workflowError) throw workflowError;

      // If we have existing workflows, use the most recent one
      if (existingWorkflows && existingWorkflows.length > 0) {
        const currentWorkflow = existingWorkflows[0];

        // Try to create a link if it doesn't exist
        const { error: linkError } = await supabase
          .from('workflow_links')
          .upsert({
            workflow_id: currentWorkflow.id,
            client_email: email,
            status: 'in_progress',
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          }, {
            onConflict: 'workflow_id,client_email',
            ignoreDuplicates: true
          });

        // Ignore unique constraint violations
        if (linkError && linkError.code !== '23505') {
          console.error('Error creating workflow link:', linkError);
        }

        return [currentWorkflow];
      }

      // Create new workflow if none exists
      const { data: newWorkflow, error: createError } = await supabase
        .from('workflows')
        .insert({
          advisor_id: userId,
          title: 'Financial Information Workflow',
          status: 'active',
          sections: defaultSections
        })
        .select()
        .single();

      if (createError) throw createError;
      if (!newWorkflow) throw new Error('Failed to create workflow');

      // Create initial workflow link
      await supabase
        .from('workflow_links')
        .insert({
          workflow_id: newWorkflow.id,
          client_email: email,
          status: 'in_progress',
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        });

      return [newWorkflow];
    } catch (error) {
      console.error('Error in initializeClientWorkflow:', error);
      throw error;
    }
  }

/*
export class WorkflowService {
  static async initializeClientWorkflow(userId: string, email: string): Promise<Workflow[]> {
    try {
      console.log('Initializing workflow for advisor:', userId);
      
      // First, check for existing workflows
      const { data: existingWorkflows, error: workflowError } = await supabase
        .from('workflows')
        .select('*')
        .eq('advisor_id', userId)
        .eq('status', 'active')
        .order('created_at', {ascending: false});

      if (workflowError) throw workflowError;

      if (existingWorkflows && existingWorkflows.length > 0) {
        console.log(`Found ${existingWorkflows.length} existing workflows`);
        

        // Check for existing link before creating a new one
        for (const workflow of existingWorkflows) {
          const { data: existingLink } = await supabase
            .from('workflow_links')
            .select('*')
            .eq('workflow_id', workflow.id)
            .eq('client_email', email)
            .single();

          if (!existingLink) {
            // Only create a new link if one doesn't exist
            const { error: linkError } = await supabase
              .from('workflow_links')
              .insert({
                workflow_id: workflow.id,
                client_email: email,
                status: 'in_progress',
                expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
              });

            if (linkError && linkError.code !== '23505') { // Ignore unique constraint violations
              throw linkError;
            }
          }
        }

        return existingWorkflows;
      }

      // Create new workflow if none exists
      console.log('Creating new workflow');
      const { data: newWorkflow, error: createError } = await supabase
        .from('workflows')
        .insert({
          advisor_id: userId,
          title: 'Financial Information Workflow',
          status: 'active',
          sections: defaultSections
        })
        .select()
        .single();

      if (createError) throw createError;
      if (!newWorkflow) throw new Error('Failed to create workflow');

      // Create initial workflow link
      const { error: linkError } = await supabase
        .from('workflow_links')
        .insert({
          workflow_id: newWorkflow.id,
          client_email: email,
          status: 'in_progress',
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        });

      if (linkError && linkError.code !== '23505') { // Ignore unique constraint violations
        throw linkError;
      }

      return [newWorkflow];
    } catch (error) {
      console.error('Error in initializeClientWorkflow:', error);
      // Return existing workflows even if link creation fails
      const { data: fallbackWorkflows } = await supabase
        .from('workflows')
        .select('*')
        .eq('advisor_id', userId)
        .eq('status', 'active');
        
      return fallbackWorkflows || [];
    }
  }
*/

  static async getWorkflowWithResponses(workflowId: string): Promise<Workflow & { responses: Record<string, any> }> {
    try {
      const { data: workflow, error: workflowError } = await supabase
        .from('workflows')
        .select('*')
        .eq('id', workflowId)
        .single();

      if (workflowError) throw workflowError;
      if (!workflow) throw new Error('Workflow not found');

      const { data: responses, error: responsesError } = await supabase
        .from('form_responses')
        .select('*')
        .eq('workflow_id', workflowId);

      if (responsesError) throw responsesError;

      const responsesMap = (responses || []).reduce((acc, response) => ({
        ...acc,
        [response.section_id]: response.data
      }), {});

      return {
        ...workflow,
        responses: responsesMap
      };
    } catch (error) {
      console.error('Error fetching workflow with responses:', error);
      throw new Error('Failed to fetch workflow data');
    }
  }

  static async getWorkflow(workflowId: string): Promise<Workflow> {
    try {
      const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .eq('id', workflowId)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Workflow not found');
      
      return data;
    } catch (error) {
      console.error('Error fetching workflow:', error);
      throw new Error('Failed to fetch workflow');
    }
  }

  static async saveFormResponse(
    workflowId: string,
    sectionId: string,
    data: Record<string, any>
  ): Promise<void> {
    try {
      const { data: existing, error: fetchError } = await supabase
        .from('form_responses')
        .select('id')
        .eq('workflow_id', workflowId)
        .eq('section_id', sectionId)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (existing?.id) {
        const { error: updateError } = await supabase
          .from('form_responses')
          .update({ data })
          .eq('id', existing.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('form_responses')
          .insert({
            workflow_id: workflowId,
            section_id: sectionId,
            data
          });

        if (insertError) throw insertError;
      }
    } catch (error) {
      console.error('Error saving form response:', error);
      throw new Error('Failed to save form response');
    }
  }

  static async getFormResponses(workflowId: string): Promise<Record<string, any>> {
    try {
      const { data, error } = await supabase
        .from('form_responses')
        .select('*')
        .eq('workflow_id', workflowId);

      if (error) throw error;

      return (data || []).reduce((acc, response) => {
        acc[response.section_id] = response.data;
        return acc;
      }, {} as Record<string, any>);
    } catch (error) {
      console.error('Error fetching form responses:', error);
      throw new Error('Failed to fetch form responses');
    }
  }

  static async getLatestFormResponses(workflowId: string): Promise<Record<string, FormResponse>> {
    try {
      const { data, error } = await supabase
        .from('form_responses')
        .select('*')
        .eq('workflow_id', workflowId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group by section_id and take the latest response for each section
      const latestResponses = data.reduce((acc, response) => {
        if (!acc[response.section_id] || 
            new Date(response.created_at) > new Date(acc[response.section_id].created_at)) {
          acc[response.section_id] = response;
        }
        return acc;
      }, {} as Record<string, FormResponse>);

      return latestResponses;
    } catch (error) {
      console.error('Error fetching latest form responses:', error);
      throw new Error('Failed to fetch latest responses');
    }
  }

  // Workflow Link Methods
  static async createWorkflowLink(workflowId: string, clientEmail: string): Promise<WorkflowLink> {
    try {
      const { data, error } = await supabase
        .from('workflow_links')
        .insert({
          workflow_id: workflowId,
          client_email: clientEmail,
          status: 'pending',
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating workflow link:', error);
      throw new Error('Failed to create workflow link');
    }
  }

  static async getWorkflowByLinkId(linkId: string): Promise<Workflow | null> {
    try {
      // Get the workflow link
      const { data: linkDataArray, error: linkError } = await supabase
        .from('workflow_links')
        .select('workflow_id, status, expires_at')
        .eq('id', linkId);

      if (linkError) {
        console.error('Error fetching workflow link:', linkError);
        throw linkError;
      }

      // Check if we got any links and get the first valid one
      const linkData = linkDataArray?.[0];
      if (!linkData || 
          new Date(linkData.expires_at) < new Date() || 
          linkData.status === 'completed') {
        console.log('No valid workflow link found');
        return null;
      }

      // Get the workflow
      const { data: workflowDataArray, error: workflowError } = await supabase
        .from('workflows')
        .select(`
          id,
          title,
          advisor_id,
          status,
          sections,
          created_at,
          updated_at
        `)
        .eq('id', linkData.workflow_id);

      if (workflowError) {
        console.error('Error fetching workflow:', workflowError);
        throw workflowError;
      }

      const workflowData = workflowDataArray?.[0];
      if (!workflowData) {
        console.log('No workflow found for link');
        return null;
      }

      // Return the workflow with proper typing
      const workflow: Workflow = {
        id: workflowData.id,
        title: workflowData.title,
        advisor_id: workflowData.advisor_id,
        status: workflowData.status,
        sections: workflowData.sections,
        created_at: workflowData.created_at,
        updated_at: workflowData.updated_at
      };

      return workflow;

    } catch (error) {
      console.error('Error in getWorkflowByLinkId:', error);
      throw new Error('Failed to fetch workflow');
    }
  }

  static async updateWorkflowLink(
    linkId: string, 
    updates: Partial<Pick<WorkflowLink, 'status' | 'expires_at'>>
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('workflow_links')
        .update(updates)
        .eq('id', linkId);

      if (error) throw error;
      console.error('Error updating workflow link:', error);
        throw error;

    } catch (error) {
      console.error('Error updating workflow link:', error);
      throw new Error('Failed to update workflow link');
    }
  }


  // Real-time subscription setup
  static subscribeToFormResponses(
    workflowId: string,
    callback: (response: any) => void
  ) {
    return supabase
      .channel(`workflow-${workflowId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'form_responses',
          filter: `workflow_id=eq.${workflowId}`
        },
        (payload) => {
          callback(payload.new as FormResponse);
        }
      )
      .subscribe();
  }

  
  // Workflow validation
  static validateWorkflow(workflow: Workflow): boolean {
    if (!workflow.sections || !Array.isArray(workflow.sections)) {
        return false;
    }

    for (const section of workflow.sections) {
        if (!section.id || !section.title || !Array.isArray(section.fields)) {
            return false;
        }

        for (const field of section.fields) {
            if (!field.id || !field.label || !field.type || !['text', 'number', 'email', 'tel', 'select', 'date', 'file'].includes(field.type)) {
                return false;
            }
        }
    }

    return true;
}
    
}