import * as cxschema from '@aws-cdk/cloud-assembly-schema';
import * as cdk from '@aws-cdk/core';
import * as cxapi from '@aws-cdk/cx-api';
import '@aws-cdk/assert/jest';

export interface MockVcpContextResponse {
  readonly vpcId: string;
  readonly vpcCidrBlock: string;
  readonly subnetGroups: cxapi.VpcSubnetGroup[];
}

export function mockContextProviderWith(
  response: MockVcpContextResponse,
  paramValidator?: (options: cxschema.VpcContextQuery) => void) {
  const previous = cdk.ContextProvider.getValue;
  cdk.ContextProvider.getValue = (_scope: cdk.Construct, options: cdk.GetContextValueOptions) => {
    if (options.provider === cxschema.ContextProvider.VPC_PROVIDER) {
      if (paramValidator) {
        paramValidator(options.props as any);
      }

      return {
        value: {
          availabilityZones: [],
          isolatedSubnetIds: undefined,
          isolatedSubnetNames: undefined,
          isolatedSubnetRouteTableIds: undefined,
          privateSubnetIds: undefined,
          privateSubnetNames: undefined,
          privateSubnetRouteTableIds: undefined,
          publicSubnetIds: undefined,
          publicSubnetNames: undefined,
          publicSubnetRouteTableIds: undefined,
          ...response,
        } as cxapi.VpcContextResponse,
      };
    } else if (options.provider === cxschema.ContextProvider.HOSTED_ZONE_PROVIDER) {
      return {
        value: {
          Id: '12345678',
          Name: 'example.com',
        },
      };
    } else {
      // unreachable
      expect(false);
      return {
        value: {},
      };
    }
  };
  return previous;
}

export function restoreContextProvider(previous: (scope: cdk.Construct, options: cdk.GetContextValueOptions) => cdk.GetContextValueResult): void {
  cdk.ContextProvider.getValue = previous;
}