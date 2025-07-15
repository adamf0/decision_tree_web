// components/TreeNode.js
import React from 'react';

const TreeNode = ({ node }) => {
  if (typeof node === 'string') {
    return <div className="ml-4 border-l-2 pl-2 text-green-600">→ {node}</div>;
  }

  return (
    <div className="ml-4 border-l-2 pl-2">
      <div className="font-semibold text-red-700">{node.attribute}</div>
      <div className="ml-4">
        {Object.entries(node.branches).map(([branchValue, branchData], idx) => (
          <div key={idx} className="mb-2">
            <div className="text-sm text-gray-700">
              <span className="font-medium text-indigo-600">{branchValue}</span>{' '}
              <span className="text-xs text-gray-500">
                (Entropy: {branchData.entropy}, Gini: {branchData.gini})
              </span>
            </div>
            <TreeNode node={branchData.node} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default TreeNode;
